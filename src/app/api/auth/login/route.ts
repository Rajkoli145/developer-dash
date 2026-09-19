import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    const owner = await db.user.findFirst({ where: { role: "OWNER" } });
    const ok =
      owner?.passwordHash &&
      owner.email === cleanEmail && // single-owner workspace: only the owner's email logs in
      verifyPassword(String(password), owner.passwordHash);

    if (!ok) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await createSession(owner.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("login failed", e);
    return NextResponse.json({ error: "Login failed. Check server logs." }, { status: 500 });
  }
}
