import { buildContextPack, type ContextOptions } from "@/lib/handoff";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  let body: Partial<ContextOptions & { taskId: string | null }> = {};
  try { body = await req.json(); } catch { /* defaults */ }
  const { taskId, ...opts } = body;
  const pack = await buildContextPack(projectId, taskId ?? null, { ...DEFAULTS, ...opts });
  return new Response(pack || "No context available.", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { DEFAULT_CONTEXT_OPTIONS } from "@/lib/handoff";
const DEFAULTS = DEFAULT_CONTEXT_OPTIONS;
