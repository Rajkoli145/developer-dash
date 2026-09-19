import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, createSession, isWorkspaceClaimed } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const claimed = await isWorkspaceClaimed();
    if (claimed) {
      return NextResponse.json({ error: "This workspace is already set up. Sign in instead." }, { status: 409 });
    }

    const { email, name, password } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanName = String(name || "").trim();
    const cleanPassword = String(password || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (cleanPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const owner = await db.user.findFirst({ where: { role: "OWNER" } });
    if (!owner) {
      return NextResponse.json({ error: "Workspace owner not found. Visit the site once to initialize it." }, { status: 500 });
    }

    await db.user.update({
      where: { id: owner.id },
      data: { email: cleanEmail, name: cleanName || cleanEmail.split("@")[0]!, passwordHash: hashPassword(cleanPassword) },
    });

    await createSession(owner.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("setup failed", e);
    return NextResponse.json({ error: "Setup failed. Check server logs." }, { status: 500 });
  }
}
