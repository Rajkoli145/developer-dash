import { db } from "./db";

export type SearchHit = {
  type: "project" | "task" | "document" | "session" | "prompt" | "decision" | "handoff";
  id: string;
  title: string;
  sub: string;
  projectKey?: string;
  projectName?: string;
  projectColor?: string;
  href: string;
};

export async function globalSearch(q: string): Promise<SearchHit[]> {
  const term = q.trim();
  if (!term) return [];
  const contains = { contains: term };

  const [projects, tasks, documents, sessions, prompts, decisions, handoffs] = await Promise.all([
    db.project.findMany({ where: { OR: [{ name: contains }, { key: contains }, { description: contains }] }, take: 5 }),
    db.task.findMany({ where: { OR: [{ title: contains }, { description: contains }] }, take: 6, include: { project: true } }),
    db.document.findMany({ where: { OR: [{ title: contains }, { description: contains }] }, take: 6, include: { projectLinks: { include: { project: true } } } }),
    db.aiSession.findMany({ where: { OR: [{ title: contains }, { summary: contains }, { goal: contains }] }, take: 6, include: { project: true } }),
    db.prompt.findMany({ where: { OR: [{ name: contains }, { description: contains }, { body: contains }] }, take: 5, include: { project: true } }),
    db.decision.findMany({ where: { OR: [{ title: contains }, { decision: contains }, { context: contains }] }, take: 5, include: { projectLinks: { include: { project: true } } } }),
    db.handoff.findMany({ where: { OR: [{ title: contains }, { objective: contains }] }, take: 5, include: { project: true } }),
  ]);

  const hits: SearchHit[] = [];

  for (const p of projects)
    hits.push({
      type: "project", id: p.id, title: p.name, sub: p.role ?? p.description ?? "Project",
      projectKey: p.key, projectName: p.name, projectColor: p.color, href: `/projects/${p.id}`,
    });
  for (const t of tasks)
    hits.push({
      type: "task", id: t.id, title: t.title, sub: `${t.status.replace("_", " ").toLowerCase()} · ${t.project.name}`,
      projectKey: t.project.key, projectName: t.project.name, projectColor: t.project.color, href: `/tasks/${t.id}`,
    });
  for (const d of documents) {
    const proj = d.projectLinks[0]?.project;
    hits.push({
      type: "document", id: d.id, title: d.title, sub: `${d.kind.toLowerCase()}${proj ? ` · ${proj.name}` : ""}`,
      projectKey: proj?.key, projectName: proj?.name, projectColor: proj?.color, href: `/documents/${d.id}`,
    });
  }
  for (const s of sessions)
    hits.push({
      type: "session", id: s.id, title: s.title, sub: `${s.agent.toLowerCase()} · ${s.project?.name ?? "Unlinked"}`,
      projectKey: s.project?.key, projectName: s.project?.name, projectColor: s.project?.color, href: `/sessions/${s.id}`,
    });
  for (const p of prompts)
    hits.push({
      type: "prompt", id: p.id, title: p.name, sub: `${p.category.toLowerCase()}${p.project ? ` · ${p.project.name}` : ""}`,
      projectKey: p.project?.key, projectName: p.project?.name, projectColor: p.project?.color, href: `/prompts?highlight=${p.id}`,
    });
  for (const d of decisions) {
    const proj = d.projectLinks[0]?.project;
    hits.push({
      type: "decision", id: d.id, title: d.title, sub: `${d.status.toLowerCase()}${proj ? ` · ${proj.name}` : ""}`,
      projectKey: proj?.key, projectName: proj?.name, projectColor: proj?.color, href: `/decisions?highlight=${d.id}`,
    });
  }
  for (const h of handoffs)
    hits.push({
      type: "handoff", id: h.id, title: h.title, sub: `handoff · ${h.project.name}`,
      projectKey: h.project.key, projectName: h.project.name, projectColor: h.project.color, href: `/projects/${h.projectId}?tab=handoffs`,
    });

  return hits;
}
