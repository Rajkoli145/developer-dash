import { db } from "./db";
import { lines } from "../utils";

export type ProjectStats = {
  total: number;
  done: number;
  progress: number;
  documents: number;
  sessions: number;
  prompts: number;
  decisions: number;
  handoffs: number;
  links: number;
  repos: number;
  designs: number;
  specs: number;
  blockers: number;
};

export async function projectStats(projectId: string): Promise<ProjectStats> {
  const project = await db.project.findUnique({ where: { id: projectId } });
  const [tasks, documents, sessions, prompts, decisions, handoffs, links] = await Promise.all([
    db.task.findMany({ where: { projectId }, select: { status: true } }),
    db.projectDocument.count({ where: { projectId } }),
    db.aiSession.count({ where: { projectId } }),
    db.prompt.count({ where: { projectId } }),
    db.projectDecision.count({ where: { projectId } }),
    db.handoff.count({ where: { projectId } }),
    db.projectLink.findMany({ where: { projectId }, select: { kind: true } }),
  ]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const base = total > 0 ? Math.round((done / total) * 100) : 0;
  const progress = project?.progressOverride ?? base;

  return {
    total,
    done,
    progress,
    documents,
    sessions,
    prompts,
    decisions,
    handoffs,
    links: links.length,
    repos: links.filter((l) => l.kind === "REPO").length,
    designs: links.filter((l) => l.kind === "DESIGN").length,
    specs: links.filter((l) => l.kind === "SPEC").length,
    blockers: tasks.filter((t) => t.status === "BLOCKED").length,
  };
}

export async function allProjects() {
  const projects = await db.project.findMany({
    include: {
      tasks: { select: { status: true } },
      _count: { select: { documents: true, sessions: true, decisions: true, handoffs: true, prompts: true, links: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  // Active projects lead the dashboard; paused/completed follow by recency.
  const statusRank: Record<string, number> = { ACTIVE: 0, PAUSED: 1, COMPLETED: 1, ARCHIVED: 2 };
  projects.sort((a, b) => (statusRank[a.status] ?? 1) - (statusRank[b.status] ?? 1));
  return projects.map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => t.status === "DONE").length;
    const progress = p.progressOverride ?? (total > 0 ? Math.round((done / total) * 100) : 0);
    return { ...p, taskTotal: total, taskDone: done, progress, docCount: p._count.documents, sessionCount: p._count.sessions };
  });
}

export async function dashboardData() {
  const [projects, activeTasks, recentSessions, recentActivity, counts] = await Promise.all([
    allProjects(),
    db.task.findMany({
      where: { status: { in: ["IN_PROGRESS", "BLOCKED", "IN_REVIEW"] } },
      include: { project: { select: { key: true, name: true, color: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 7,
    }),
    db.aiSession.findMany({
      include: { project: { select: { key: true, name: true, color: true } } },
      orderBy: { spentAt: "desc" },
      take: 5,
    }),
    db.activity.findMany({
      include: { project: { select: { key: true, name: true, color: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    Promise.all([
      db.project.count({ where: { status: "ACTIVE" } }),
      db.task.count({ where: { status: "IN_PROGRESS" } }),
      db.task.count({ where: { status: "BLOCKED" } }),
      db.document.count(),
      db.aiSession.count(),
      db.prompt.count(),
    ]),
  ]);

  const [activeProjects, tasksInProgress, blockers, documents, sessions, prompts] = counts;

  // next actions: highest-priority open tasks with a due date, then by priority
  const nextActions = await db.task.findMany({
    where: { status: { in: ["TODO", "IN_PROGRESS"] } },
    include: { project: { select: { key: true, name: true, color: true } } },
    orderBy: { priority: "desc" },
    take: 4,
  });

  return {
    projects,
    activeTasks,
    recentSessions,
    recentActivity,
    nextActions,
    stats: { activeProjects, tasksInProgress, blockers, documents, sessions, prompts },
  };
}

export function splitLines(value: string | null | undefined): string[] {
  return lines(value);
}
