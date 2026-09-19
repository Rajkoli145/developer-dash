"use server";
import { db } from "./db";
import { lines } from "../utils";
import { COLOR_HEX } from "./constants";
import { isWorkspaceClaimed } from "./auth";

const OWNER_ROLE = "OWNER";

/**
 * The acting user: must be an authenticated session. There is no env-owner
 * fallback — unauthenticated callers get rejected instead of acting as someone.
 * (First-run onboarding creates the owner via /api/auth/setup, then signs in.)
 */
export async function currentUser() {
  const { getSessionUser } = await import("./auth");
  const session = await getSessionUser();
  if (!session) throw new Error("UNAUTHENTICATED");
  return db.user.findUniqueOrThrow({ where: { id: session.id } });
}

/**
 * Owner bootstrap for the first-run dashboard: when the workspace is still
 * unclaimed (no password/passkey yet) the env-configured owner can be created
 * so /setup can claim them. Signed-in requests always use the session user.
 */
export async function currentUserOrUnclaimedOwner() {
  const { getSessionUser } = await import("./auth");
  const session = await getSessionUser();
  if (session) return db.user.findUniqueOrThrow({ where: { id: session.id } });

  // Only when the workspace is NOT yet claimed may we touch the owner record.
  if (await isWorkspaceClaimed()) throw new Error("UNAUTHENTICATED");

  const email = (process.env.OWNER_EMAIL || "owner@localhost").trim().toLowerCase();
  const name = (process.env.OWNER_NAME || "").trim() || email.split("@")[0]!;
  return db.user.upsert({
    where: { email },
    update: {},
    create: { email, name, role: OWNER_ROLE },
  });
}

export async function logActivity(input: {
  kind: string;
  message: string;
  projectId?: string | null;
  taskId?: string | null;
  documentId?: string | null;
  userId?: string | null;
}) {
  await db.activity.create({
    data: {
      kind: input.kind,
      message: input.message,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      documentId: input.documentId ?? null,
      userId: input.userId ?? (await currentUser()).id,
    },
  });
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createProject(formData: FormData) {
  const user = await currentUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const key = (String(formData.get("key") || "").trim() || name.slice(0, 12)).toUpperCase().replace(/\s+/g, "-");
  const color = String(formData.get("color") || "blue");
  await db.project.create({
    data: {
      name,
      key,
      color: COLOR_HEX[color] ? color : "blue",
      description: String(formData.get("description") || "") || null,
      role: String(formData.get("role") || "") || null,
      mission: String(formData.get("mission") || "") || null,
      objective: String(formData.get("objective") || "") || null,
      milestone: String(formData.get("milestone") || "") || null,
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  await logActivity({ kind: "project_created", message: `Created project ${name}` });
}

export async function updateProject(formData: FormData) {
  const id = String(formData.get("id") || "");
  const data: Record<string, string | null> = {};
  for (const f of ["name", "key", "description", "role", "mission", "architecture", "techStack", "constraints", "devRules", "objective", "objectiveLabel", "milestone", "status", "color", "githubUrl"]) {
    const v = formData.get(f);
    if (v !== null) data[f] = String(v) || null;
  }
  if (data.color && !COLOR_HEX[data.color]) delete data.color;
  const milestoneDate = String(formData.get("milestoneDate") || "");
  const patch: Record<string, unknown> = { ...data };
  if (milestoneDate) patch.milestoneDate = new Date(milestoneDate);
  const prog = formData.get("progressOverride");
  if (prog !== null && prog !== "") {
    const n = Number(prog);
    if (!Number.isNaN(n)) patch.progressOverride = Math.max(0, Math.min(100, Math.round(n)));
  } else if (prog !== null) {
    patch.progressOverride = null;
  }
  await db.project.update({ where: { id }, data: patch });
  await logActivity({ kind: "project_updated", message: `Updated project settings`, projectId: id });
}

export async function createTask(formData: FormData) {
  const user = await currentUser();
  const title = String(formData.get("title") || "").trim();
  const projectId = String(formData.get("projectId") || "");
  if (!title || !projectId) return;
  const due = String(formData.get("dueDate") || "");
  const task = await db.task.create({
    data: {
      title,
      description: String(formData.get("description") || "") || null,
      status: String(formData.get("status") || "TODO"),
      priority: String(formData.get("priority") || "MEDIUM"),
      projectId,
      dueDate: due ? new Date(due) : null,
      createdById: user.id,
      assigneeId: user.id,
    },
  });
  await logActivity({ kind: "task_created", message: `Created task “${title}”`, projectId, taskId: task.id, userId: user.id });
}

export async function updateTask(formData: FormData) {
  const id = String(formData.get("id") || "");
  const prev = await db.task.findUnique({ where: { id } });
  if (!prev) return;
  const data: Record<string, string | null> = {};
  for (const f of ["title", "description", "status", "priority", "notes"]) {
    const v = formData.get(f);
    if (v !== null) data[f] = String(v);
  }
  const due = String(formData.get("dueDate") || "");
  const patch: Record<string, unknown> = { ...data };
  patch.dueDate = due ? new Date(due) : null;
  await db.task.update({ where: { id }, data: patch });
  if (data.status && data.status !== prev.status) {
    if (data.status === "DONE") {
      await logActivity({ kind: "task_completed", message: `Completed task “${prev.title}”`, projectId: prev.projectId, taskId: id });
    } else {
      await logActivity({ kind: "task_status", message: `Moved “${prev.title}” to ${data.status.replace("_", " ").toLowerCase()}`, projectId: prev.projectId, taskId: id });
    }
  }
}

export async function setTaskStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const prev = await db.task.findUnique({ where: { id } });
  if (!prev || !status) return;
  await db.task.update({ where: { id }, data: { status } });
  if (status === "DONE") {
    await logActivity({ kind: "task_completed", message: `Completed task “${prev.title}”`, projectId: prev.projectId, taskId: id });
  }
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") || "");
  await db.task.delete({ where: { id } });
}

export async function createDocument(formData: FormData) {
  const user = await currentUser();
  const title = String(formData.get("title") || "").trim();
  const projectId = String(formData.get("projectId") || "");
  if (!title) return;
  const file = formData.get("file");
  let kind = String(formData.get("kind") || "MARKDOWN");
  let filePath: string | null = null;
  let fileMime: string | null = null;
  let fileSize: number | null = null;
  let content: string | null = String(formData.get("content") || "") || null;

  if (file instanceof File && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    // Bytes live in Postgres (FileBlob) — files survive server restarts,
    // redeploys, and /tmp wipes exactly like every other record.
    fileMime = file.type || "application/octet-stream";
    fileSize = file.size;
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "";
    if (ext === "PDF") kind = "PDF";
    else if (ext === "MD") kind = "MARKDOWN";
    else if (ext === "TXT") kind = "TEXT";
    else if (["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG"].includes(ext)) kind = "IMAGE";
    else kind = "OTHER";
    content = null;

    const doc = await db.document.create({
      data: {
        title,
        kind,
        category: String(formData.get("category") || "") || null,
        description: String(formData.get("description") || "") || null,
        externalUrl: String(formData.get("externalUrl") || "") || null,
        content,
        fileMime,
        fileSize,
        uploaderId: user.id,
        versions: { create: { version: 1, note: "Initial version" } },
        fileBlob: { create: { bytes, mime: fileMime, size: file.size } },
      },
    });
    await finishDocumentCreate(doc.id, projectId, title, user.id);
    return;
  }

  const doc = await db.document.create({
    data: {
      title,
      kind,
      category: String(formData.get("category") || "") || null,
      description: String(formData.get("description") || "") || null,
      externalUrl: String(formData.get("externalUrl") || "") || null,
      content,
      filePath,
      fileMime,
      fileSize,
      uploaderId: user.id,
      versions: { create: { version: 1, note: "Initial version" } },
    },
  });
  if (projectId) {
    await db.projectDocument.create({ data: { projectId, documentId: doc.id } });
  }
  await logActivity({
    kind: "document_uploaded",
    message: `Added document “${title}”`,
    projectId: projectId || null,
    documentId: doc.id,
    userId: user.id,
  });
}

async function finishDocumentCreate(documentId: string, projectId: string, title: string, userId: string) {
  if (projectId) {
    await db.projectDocument.create({ data: { projectId, documentId } });
  }
  await logActivity({
    kind: "document_uploaded",
    message: `Added document “${title}”`,
    projectId: projectId || null,
    documentId,
    userId,
  });
}

export async function attachDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") || "");
  const targetType = String(formData.get("targetType") || "");
  const targetId = String(formData.get("targetId") || "");
  if (!documentId || !targetId) return;
  if (targetType === "task") {
    await db.taskDocument.upsert({ where: { taskId_documentId: { taskId: targetId, documentId } }, create: { taskId: targetId, documentId }, update: {} });
  } else if (targetType === "session") {
    await db.sessionDocument.upsert({ where: { sessionId_documentId: { sessionId: targetId, documentId } }, create: { sessionId: targetId, documentId }, update: {} });
  } else if (targetType === "decision") {
    await db.decisionDocument.upsert({ where: { decisionId_documentId: { decisionId: targetId, documentId } }, create: { decisionId: targetId, documentId }, update: {} });
  }
}

export async function detachDocument(formData: FormData) {
  const documentId = String(formData.get("documentId") || "");
  const targetType = String(formData.get("targetType") || "");
  const targetId = String(formData.get("targetId") || "");
  if (!documentId || !targetId) return;
  if (targetType === "task") await db.taskDocument.deleteMany({ where: { taskId: targetId, documentId } });
  else if (targetType === "session") await db.sessionDocument.deleteMany({ where: { sessionId: targetId, documentId } });
  else if (targetType === "decision") await db.decisionDocument.deleteMany({ where: { decisionId: targetId, documentId } });
}

export async function deleteDocument(formData: FormData) {
  const id = String(formData.get("id") || "");
  // FileBlob rows cascade-delete with the document (schema onDelete: Cascade).
  await db.document.delete({ where: { id } });
}

export async function createSession(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const agent = String(formData.get("agent") || "CLAUDE");
  const taskId = String(formData.get("taskId") || "");
  const docIds = formData.getAll("documentIds").map(String).filter(Boolean);
  const spentAt = String(formData.get("spentAt") || "");

  await db.aiSession.create({
    data: {
      title,
      agent,
      goal: String(formData.get("goal") || "") || null,
      prompt: String(formData.get("prompt") || "") || null,
      summary: String(formData.get("summary") || "") || null,
      actions: lines(String(formData.get("actions") || "")).join("\n"),
      filesChanged: lines(String(formData.get("filesChanged") || "")).join("\n"),
      decisions: String(formData.get("decisions") || "") || null,
      problems: String(formData.get("problems") || "") || null,
      result: String(formData.get("result") || "NEUTRAL"),
      nextStep: String(formData.get("nextStep") || "") || null,
      projectId: projectId || null,
      spentAt: spentAt ? new Date(spentAt) : new Date(),
      taskLinks: taskId ? { create: { taskId } } : undefined,
      documents: { create: docIds.map((documentId) => ({ documentId })) },
    },
  });
  await logActivity({ kind: "session_logged", message: `Logged ${agent.charAt(0) + agent.slice(1).toLowerCase()} session “${title}”`, projectId: projectId || null });
}

export async function deleteSession(formData: FormData) {
  const id = String(formData.get("id") || "");
  await db.aiSession.delete({ where: { id } });
}

export async function createPrompt(formData: FormData) {
  const user = await currentUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  await db.prompt.create({
    data: {
      name,
      body: String(formData.get("body") || ""),
      description: String(formData.get("description") || "") || null,
      category: String(formData.get("category") || "General"),
      tags: String(formData.get("tags") || "") || null,
      projectId: String(formData.get("projectId") || "") || null,
      createdById: user.id,
    },
  });
  await logActivity({ kind: "prompt_saved", message: `Saved prompt “${name}”`, projectId: String(formData.get("projectId") || "") || null });
}

export async function usePrompt(formData: FormData) {
  const id = String(formData.get("id") || "");
  const taskId = String(formData.get("taskId") || "");
  await db.prompt.update({ where: { id }, data: { usageCount: { increment: 1 } } });
  await db.promptUsage.create({ data: { promptId: id, taskId: taskId || null } });
}

export async function deletePrompt(formData: FormData) {
  const id = String(formData.get("id") || "");
  await db.prompt.delete({ where: { id } });
}

export async function createDecision(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const projectId = String(formData.get("projectId") || "");
  const decidedAt = String(formData.get("decidedAt") || "");
  await db.decision.create({
    data: {
      title,
      context: String(formData.get("context") || "") || null,
      decision: String(formData.get("decision") || ""),
      reason: String(formData.get("reason") || "") || null,
      alternatives: String(formData.get("alternatives") || "") || null,
      consequences: String(formData.get("consequences") || "") || null,
      status: String(formData.get("status") || "ACCEPTED"),
      decidedAt: decidedAt ? new Date(decidedAt) : new Date(),
      projectLinks: projectId ? { create: { projectId } } : undefined,
    },
  });
  await logActivity({ kind: "decision_created", message: `Recorded decision “${title}”`, projectId: projectId || null });
}

export async function updateDecisionStatus(formData: FormData) {
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !status) return;
  await db.decision.update({ where: { id }, data: { status } });
}

export async function deleteDecision(formData: FormData) {
  const id = String(formData.get("id") || "");
  await db.decision.delete({ where: { id } });
}

export async function createLink(formData: FormData) {
  const projectId = String(formData.get("projectId") || "");
  const label = String(formData.get("label") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!projectId || !label || !url) return;
  await db.projectLink.create({ data: { projectId, label, url, kind: String(formData.get("kind") || "LINK") } });
}

export async function deleteLink(formData: FormData) {
  const id = String(formData.get("id") || "");
  await db.projectLink.delete({ where: { id } });
}

export async function generateHandoff(formData: FormData) {
  const user = await currentUser();
  const projectId = String(formData.get("projectId") || "");
  if (!projectId) return;
  const { buildHandoff } = await import("./handoff");
  await buildHandoff(projectId, user.id);
}
