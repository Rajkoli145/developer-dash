import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

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
  // Defense in depth: middleware already gates this, but never serve uploads without a session.
  if (!(await getSessionUserId())) return new Response("Unauthorized", { status: 401 });

  const { path: parts } = await params;
  const rel = parts.join("/");
  if (rel.includes("..")) return new Response("Bad request", { status: 400 });

  // Preferred path: /api/files/<documentId> — bytes come straight from Postgres.
  const blob = await db.fileBlob
    .findUnique({ where: { documentId: rel }, select: { bytes: true, mime: true } })
    .catch(() => null);
  if (blob) {
    return new Response(new Uint8Array(blob.bytes), {
      headers: {
        "Content-Type": blob.mime,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  // Legacy fallback: files uploaded before DB storage went to the uploads dir.
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
