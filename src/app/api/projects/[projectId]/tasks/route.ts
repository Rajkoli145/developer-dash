import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const tasks = await db.task.findMany({
    where: { projectId },
    select: { id: true, title: true, status: true },
    orderBy: [{ status: "asc" }, { priority: "desc" }],
    take: 50,
  });
  return NextResponse.json(tasks);
}
