import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const creds = await db.authCredential.findMany({
    where: { userId: user.id },
    select: { id: true, label: true, deviceType: true, createdAt: true, lastUsedAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(creds);
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await req.json();
  await db.authCredential.deleteMany({ where: { id: String(id), userId: user.id } });
  return NextResponse.json({ ok: true });
}
