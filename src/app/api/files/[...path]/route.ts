import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const rel = parts.join("/");
  if (rel.includes("..")) return new Response("Bad request", { status: 400 });
  // Mirrors the upload root logic in lib/actions.ts (serverless → /tmp).
  const uploadRoot = process.env.UPLOAD_DIR || (process.env.VERCEL ? "/tmp/uploads" : "uploads");
  const abs = path.isAbsolute(uploadRoot)
    ? path.join(uploadRoot, rel)
    : path.join(process.cwd(), uploadRoot, rel);
  try {
    const data = await readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": MIME[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
