import { db } from "./db";
import { lines } from "../utils";
import { AGENT_LABEL } from "./constants";
import type { ProjectStats } from "./data";

const nl = (arr: string[]) => arr.map((s) => `- ${s}`).join("\n");

export type BuildHandoffOpts = {
  title?: string;
  testStatus?: string;
  openQuestions?: string;
};

export async function buildHandoff(projectId: string, userId: string, opts: BuildHandoffOpts = {}) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: { orderBy: [{ priority: "desc" }, { updatedAt: "desc" }] },
      documents: { include: { document: true } },
      decisions: { include: { decision: true }, take: 8 },
      sessions: { orderBy: { spentAt: "desc" }, take: 5 },
      handoffs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!project) return null;

  const completed = project.tasks.filter((t) => t.status === "DONE");
  const inProgress = project.tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW");
  const blocked = project.tasks.filter((t) => t.status === "BLOCKED");
  const upcoming = project.tasks.filter((t) => t.status === "TODO");

  const filesChanged = Array.from(new Set(project.sessions.flatMap((s) => lines(s.filesChanged))));

  const handoff = await db.handoff.create({
    data: {
      title: opts.title || `Handoff — ${formatStamp()}`,
      objective: project.objective || project.description || null,
      currentTask: inProgress[0]?.title || null,
      completed: nl(completed.slice(0, 8).map((t) => t.title)),
      inProgress: nl(inProgress.map((t) => t.title)),
      nextSteps: nl(upcoming.slice(0, 6).map((t) => t.title)),
      blockers: blocked.length ? nl(blocked.map((t) => `${t.title}${t.description ? ` — ${t.description}` : ""}`)) : "None",
      decisions: nl(project.decisions.map((d) => `${d.decision.title} (${d.decision.status.toLowerCase()})`)),
      filesChanged: filesChanged.length ? nl(filesChanged.slice(0, 12)) : null,
      testStatus: opts.testStatus || null,
      openQuestions: opts.openQuestions || null,
      projectId,
      createdById: userId,
    },
  });

  await db.activity.create({
    data: {
      kind: "handoff_generated",
      message: `Generated handoff “${handoff.title}”`,
      projectId,
      userId,
    },
  });

  return handoff;
}

function formatStamp() {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function handoffMarkdown(handoff: HandoffLike, projectName: string): string {
  const section = (title: string, body: string | null | undefined) =>
    body ? `## ${title}\n${body}\n` : "";
  return [
    `# ${handoff.title}`,
    `**Project:** ${projectName}`,
    `**Generated:** ${formatStamp()} · via DevContext`,
    "",
    section("Current Objective", handoff.objective),
    section("Current Task", handoff.currentTask),
    section("Completed Work", handoff.completed),
    section("Work In Progress", handoff.inProgress),
    section("Next Steps", handoff.nextSteps),
    section("Blockers", handoff.blockers),
    section("Important Decisions", handoff.decisions),
    section("Files Changed", handoff.filesChanged),
    section("Test Status", handoff.testStatus),
    section("Open Questions", handoff.openQuestions),
  ]
    .filter(Boolean)
    .join("\n");
}

export type HandoffLike = {
  title: string;
  objective: string | null;
  currentTask: string | null;
  completed: string | null;
  inProgress: string | null;
  nextSteps: string | null;
  blockers: string | null;
  decisions: string | null;
  filesChanged: string | null;
  testStatus: string | null;
  openQuestions: string | null;
};

export type ContextOptions = {
  projectContext: boolean;
  currentTask: boolean;
  documents: boolean;
  sessions: boolean;
  decisions: boolean;
  prompts: boolean;
  completed: boolean;
  handoff: boolean;
};

export const DEFAULT_CONTEXT_OPTIONS: ContextOptions = {
  projectContext: true,
  currentTask: true,
  documents: true,
  sessions: true,
  decisions: true,
  prompts: false,
  completed: true,
  handoff: true,
};

export async function buildContextPack(
  projectId: string,
  taskId: string | null,
  opts: ContextOptions = DEFAULT_CONTEXT_OPTIONS
): Promise<string> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: { orderBy: [{ priority: "desc" }, { updatedAt: "desc" }] },
      documents: { include: { document: true } },
      decisions: { include: { decision: true }, take: 8 },
      sessions: { orderBy: { spentAt: "desc" }, take: 3 },
      prompts: { orderBy: { usageCount: "desc" }, take: 3 },
      handoffs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!project) return "";

  const out: string[] = [];

  if (opts.projectContext) {
    out.push(`PROJECT:\n${project.name}`);
    if (project.description) out.push(`MISSION:\n${project.description}`);
    if (project.objective) out.push(`OBJECTIVE:\n${project.objective}`);
    if (project.milestone) out.push(`NEXT MILESTONE:\n${project.milestone}${project.milestoneDate ? ` — ${formatStamp()}` : ""}`);
    if (project.techStack) out.push(`TECH STACK:\n${project.techStack}`);
  }

  let activeTask = taskId ? project.tasks.find((t) => t.id === taskId) : undefined;
  if (!activeTask) activeTask = project.tasks.find((t) => t.status === "IN_PROGRESS") ?? project.tasks.find((t) => t.status === "TODO");
  if (opts.currentTask && activeTask) {
    const parts = [activeTask.title];
    if (activeTask.description) parts.push(activeTask.description);
    if (activeTask.notes) parts.push(`Next action: ${activeTask.notes}`);
    out.push(`CURRENT TASK:\n${parts.join("\n")}`);
  }

  if (opts.documents) {
    let docs = project.documents.map((pd) => pd.document);
    if (activeTask) {
      const taskDocs = await db.taskDocument.findMany({
        where: { taskId: activeTask.id },
        include: { document: true },
      });
      const linked = taskDocs.map((td) => td.document);
      if (linked.length) docs = Array.from(new Map([...linked, ...docs].map((d) => [d.id, d])).values());
    }
    out.push(
      `RELEVANT DOCUMENTS:\n${docs.length ? docs.slice(0, 6).map((d) => `- ${d.title}${d.filePath ? "" : d.externalUrl ? ` (${d.externalUrl})` : ""}`).join("\n") : "None"}`
    );
  }

  if (opts.sessions) {
    const s = project.sessions.map((sess) => {
      const bits = [`- [${AGENT_LABEL[sess.agent] ?? sess.agent}] ${sess.title}`];
      if (sess.summary) bits.push(`  ${sess.summary}`);
      const files = lines(sess.filesChanged).slice(0, 4);
      if (files.length) bits.push(`  Files: ${files.join(", ")}`);
      return bits.join("\n");
    });
    out.push(`RECENT AI SESSIONS:\n${s.length ? s.join("\n") : "None"}`);
  }

  if (opts.decisions) {
    const d = project.decisions.map((pd) => `- ${pd.decision.title}: ${pd.decision.decision} (${pd.decision.status.toLowerCase()})`);
    out.push(`DECISIONS:\n${d.length ? d.join("\n") : "None"}`);
  }

  if (opts.prompts) {
    const p = project.prompts.map((pr) => `- ${pr.name}: ${lines(pr.body)[0] ?? ""}`);
    out.push(`IMPORTANT PROMPTS:\n${p.length ? p.join("\n") : "None"}`);
  }

  if (opts.completed) {
    const done = project.tasks.filter((t) => t.status === "DONE").slice(0, 6);
    out.push(`COMPLETED:\n${done.length ? done.map((t) => `- ${t.title}`).join("\n") : "None"}`);
  }

  if (opts.handoff) {
    const h = project.handoffs[0];
    if (h) {
      const parts = [
        h.nextSteps ? `NEXT STEPS:\n${h.nextSteps}` : null,
        h.blockers ? `BLOCKERS:\n${h.blockers}` : null,
        h.filesChanged ? `FILES CHANGED:\n${h.filesChanged}` : null,
        h.testStatus ? `TEST STATUS:\n${h.testStatus}` : null,
        h.openQuestions ? `OPEN QUESTIONS:\n${h.openQuestions}` : null,
      ].filter(Boolean);
      if (parts.length) out.push(parts.join("\n\n"));
    }
  }

  return out.join("\n\n");
}
