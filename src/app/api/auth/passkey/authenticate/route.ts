import { NextResponse } from "next/server";
import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

function rpOrigin(req: Request): string {
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Step 1: list which passkeys exist and hand the browser assertion options.
export async function GET(req: Request) {
  const owner = await db.user.findFirst({ where: { role: "OWNER" } });
  if (!owner) return NextResponse.json({ error: "No workspace yet" }, { status: 404 });

  const creds = await db.authCredential.findMany({ where: { userId: owner.id } });
  if (creds.length === 0) {
    return NextResponse.json({ available: false });
  }

  const options = await generateAuthenticationOptions({
    rpID: new URL(rpOrigin(req)).hostname,
    allowCredentials: creds.map((c) => ({ id: c.id, transports: c.transports?.split(",") as never })),
    userVerification: "preferred",
  });

  const rsp = NextResponse.json({ available: true, options });
  rsp.cookies.set("dc_webauthn_auth", options.challenge, {
    httpOnly: true, sameSite: "lax", secure: process.env.VERCEL === "1", maxAge: 300, path: "/",
  });
  return rsp;
}

// Step 2: verify the fingerprint/Touch ID assertion and start a session.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const origin = rpOrigin(req);
    const rpID = new URL(origin).hostname;
    const credentialId = body?.id;
    if (!credentialId) return NextResponse.json({ error: "Missing credential" }, { status: 400 });

    const cred = await db.authCredential.findUnique({ where: { id: String(credentialId) } });
    if (!cred) return NextResponse.json({ error: "Unknown passkey" }, { status: 404 });

    const expectedChallenge = req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("dc_webauthn_auth="))
      ?.split("=")[1];

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: expectedChallenge ?? "",
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.id,
        publicKey: new Uint8Array(Buffer.from(cred.publicKey, "base64url")),
        counter: cred.counter,
        transports: (cred.transports ?? "").split(",").filter(Boolean) as never,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Verification failed" }, { status: 401 });
    }

    await db.authCredential.update({
      where: { id: cred.id },
      data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
    });

    await createSession(cred.userId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("passkey auth failed", e);
    return NextResponse.json({ error: "Could not verify passkey." }, { status: 400 });
  }
}
