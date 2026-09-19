import { NextResponse } from "next/server";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const RP_NAME = "DevContext";

function rpOrigin(req: Request): string {
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? url.host;
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Step 1: create the credential-creation options the browser authenticator needs.
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await db.authCredential.findMany({ where: { userId: user.id } });
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: new URL(rpOrigin(req)).hostname,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    userDisplayName: user.name,
    excludeCredentials: existing.map((c) => ({ id: c.id, transports: c.transports?.split(",") as never })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });

  const jarRsp = NextResponse.json(options);
  // Challenge must be verified in step 2 — carry it in a short-lived httpOnly cookie.
  jarRsp.cookies.set("dc_webauthn_reg", options.challenge, {
    httpOnly: true, sameSite: "lax", secure: process.env.VERCEL === "1", maxAge: 300, path: "/",
  });
  return jarRsp;
}

// Step 2: verify the attestation from Touch ID / security key and store the credential.
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  try {
    const body = await req.json();
    const origin = rpOrigin(req);
    const rpID = new URL(origin).hostname;
    const expectedChallenge = req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("dc_webauthn_reg="))
      ?.split("=")[1];

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: expectedChallenge ?? "",
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Registration verification failed" }, { status: 400 });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
    await db.authCredential.create({
      data: {
        id: credential.id,
        userId: user.id,
        publicKey: Buffer.from(credential.publicKey).toString("base64url"),
        counter: credential.counter,
        deviceType: credentialBackedUp ? "multiDevice" : credentialDeviceType,
        transports: (credential.transports ?? []).join(",") || null,
        label: String(body.label || "This device").slice(0, 60),
      },
    });

    const rsp = NextResponse.json({ ok: true });
    rsp.cookies.delete("dc_webauthn_reg");
    return rsp;
  } catch (e) {
    console.error("passkey register failed", e);
    return NextResponse.json({ error: "Could not register passkey." }, { status: 400 });
  }
}
