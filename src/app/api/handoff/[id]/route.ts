import { db } from "@/lib/db";
import { handoffMarkdown } from "@/lib/handoff";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = new URL(req.url).searchParams.get("format");
  const handoff = await db.handoff.findUnique({ where: { id }, include: { project: true } });
  if (!handoff) return new Response("Not found", { status: 404 });

  if (format === "json") {
    return new Response(JSON.stringify(handoff, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="handoff-${handoff.project.key.toLowerCase()}.json"`,
      },
    });
  }
  return new Response(handoffMarkdown(handoff, handoff.project.name), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
