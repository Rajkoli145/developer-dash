import Link from "next/link";
import {
  BookOpen, Boxes, FileText, Link2, ListChecks, ScrollText, ShieldCheck, TriangleAlert,
} from "lucide-react";
import { Ring, ProgressBar, StatusBadge, Empty } from "@/components/ui";
import { dueLabel, lines, relTime, truncate } from "@/utils";
import type { ProjectStats } from "@/lib/data";
import type { Project as PrismaProject } from "@prisma/client";
import ContextPackPanel from "@/components/ContextPackPanel";

type Project = PrismaProject;

export default function OverviewTab({ project, stats }: { project: Project; stats: ProjectStats }) {
  const stack = lines(project.techStack);

  return (
    <div className="stack">
      <div className="grid-main-side">
        <div className="stack">
          {/* Project overview */}
          <section className="ink-card card-pad" style={{ padding: 28 }}>
            <div className="tiny strong" style={{ letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,242,238,0.55)" }}>
              What is this project
            </div>
            <h2 style={{ fontSize: 26, marginTop: 8, letterSpacing: "-0.03em" }}>{project.name}</h2>
            <p style={{ marginTop: 6, color: "rgba(244,242,238,0.8)", maxWidth: 560, fontSize: 15 }}>
              {project.description ?? "No description yet."}
            </p>
            {project.mission && (
              <p style={{ marginTop: 10, color: "rgba(244,242,238,0.62)", maxWidth: 560, fontSize: 13.5 }}>
                {project.mission}
              </p>
            )}
            <div className="row wrap mt-3" style={{ gap: 10 }}>
              <span className="pill-glass">◆ {project.objectiveLabel ?? "Current objective"}: {project.objective ?? "—"}</span>
              {project.milestone && (
                <span className="pill-glass">
                  ⚑ Next milestone: {project.milestone}
                  {project.milestoneDate ? ` · ${dueLabel(project.milestoneDate)}` : ""}
                </span>
              )}
            </div>
          </section>

          {/* Current task + blockers */}
          <div className="grid-2">
            <CurrentTaskCard projectId={project.id} />
            <BlockersCard projectId={project.id} />
          </div>

          {/* Context overview */}
          {(project.architecture || stack.length > 0 || project.constraints || project.devRules) && (
            <section className="card card-pad">
              <div className="card-head">
                <h3 className="card-title">Project context</h3>
                <span className="chip tiny">The why &amp; the how</span>
              </div>
              <div className="grid-2">
                {project.architecture && (
                  <div>
                    <div className="tiny strong muted" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>Architecture</div>
                    <p className="small mt-1" style={{ whiteSpace: "pre-wrap" }}>{project.architecture}</p>
                  </div>
                )}
                {stack.length > 0 && (
                  <div>
                    <div className="tiny strong muted" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>Tech stack</div>
                    <div className="row wrap mt-1" style={{ gap: 6 }}>
                      {stack.map((s) => <span key={s} className="chip tiny">{s}</span>)}
                    </div>
                  </div>
                )}
                {project.constraints && (
                  <div>
                    <div className="tiny strong muted" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>Constraints</div>
                    <p className="small mt-1" style={{ whiteSpace: "pre-wrap" }}>{project.constraints}</p>
                  </div>
                )}
                {project.devRules && (
                  <div>
                    <div className="tiny strong muted" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>Development rules</div>
                    <p className="small mt-1" style={{ whiteSpace: "pre-wrap" }}>{project.devRules}</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        <div className="stack">
          {/* Progress */}
          <section className="card card-pad center">
            <Ring value={stats.progress} size={150} stroke={12} color={project.color}>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.04em" }}>{stats.progress}%</div>
                <div className="tiny muted strong" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>progress</div>
              </div>
            </Ring>
            <div className="small muted mt-2">{stats.done} / {stats.total} tasks completed</div>
            <div className="mt-2">
              <ProgressBar value={stats.progress} cls={project.color === "teal" || project.color === "gold" ? "p-blue" : `p-${project.color}`} />
            </div>
          </section>

          {/* Resource hub */}
          <section className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ fontSize: 15.5 }}>Resource hub</h3>
              <Link className="card-link" href={`/projects/${project.id}?tab=documents`}>Open →</Link>
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <HubTile href={`/projects/${project.id}?tab=documents`} icon={<FileText size={15} />} cls="ico-blue" label="Documents" value={stats.documents} />
              <HubTile href={`/projects/${project.id}?tab=documents`} icon={<Link2 size={15} />} cls="ico-gold" label="Links" value={stats.links} />
              <HubTile href={`/projects/${project.id}?tab=documents`} icon={<Githubish />} cls="ico-purple" label="Repositories" value={stats.repos} />
              <HubTile href={`/projects/${project.id}?tab=documents`} icon={<ScrollText size={15} />} cls="ico-teal" label="Specs" value={stats.specs} />
              <HubTile href={`/projects/${project.id}?tab=sessions`} icon={<Boxes size={15} />} cls="ico-orange" label="AI sessions" value={stats.sessions} />
              <HubTile href={`/projects/${project.id}?tab=decisions`} icon={<BookOpen size={15} />} cls="ico-green" label="Decisions" value={stats.decisions} />
            </div>
          </section>

          {/* Context pack */}
          <ContextPackPanel projectId={project.id} compact />
        </div>
      </div>
    </div>
  );
}

function HubTile({ href, icon, cls, label, value }: { href: string; icon: React.ReactNode; cls: string; label: string; value: number }) {
  return (
    <Link href={href} className="row-item" style={{ border: "1px solid var(--line)", background: "var(--card-2)" }}>
      <span className={`stat-ico ${cls}`}>{icon}</span>
      <span className="row-grow">
        <span className="row-title" style={{ fontSize: 13 }}>{label}</span>
      </span>
      <span className="strong">{value}</span>
    </Link>
  );
}

function Githubish() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

async function CurrentTaskCard({ projectId }: { projectId: string }) {
  const { db } = await import("@/lib/db");
  const task = await db.task.findFirst({
    where: { projectId, status: { in: ["IN_PROGRESS", "IN_REVIEW"] } },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <section className="card card-pad">
      <div className="card-head">
        <h3 className="card-title" style={{ fontSize: 15.5 }}>Current task</h3>
        <ListChecks size={16} className="muted" />
      </div>
      {task ? (
        <div className="stack-sm">
          <div className="row spread">
            <span className="strong">{task.title}</span>
            <StatusBadge status={task.status} />
          </div>
          {task.description && <p className="small muted clamp-2">{task.description}</p>}
          {task.notes && (
            <div className="row-item" style={{ border: "1px solid var(--line)", background: "var(--blue-soft)" }}>
              <span className="small"><span className="strong">Next action:</span> {truncate(task.notes, 90)}</span>
            </div>
          )}
          <div className="row spread small muted">
            <span>{task.dueDate ? `Due ${dueLabel(task.dueDate)}` : "No due date"}</span>
            <Link className="card-link" href={`/tasks/${task.id}`}>Open task →</Link>
          </div>
        </div>
      ) : (
        <Empty icon={<ListChecks size={18} />} title="No task in progress" sub="Pick up the next task from the board." />
      )}
    </section>
  );
}

async function BlockersCard({ projectId }: { projectId: string }) {
  const { db } = await import("@/lib/db");
  const blocked = await db.task.findMany({
    where: { projectId, status: "BLOCKED" },
    orderBy: { updatedAt: "desc" },
    take: 4,
  });
  return (
    <section className="card card-pad" style={blocked.length === 0 ? { background: "linear-gradient(150deg, var(--green-soft), var(--card) 70%)" } : undefined}>
      <div className="card-head">
        <h3 className="card-title" style={{ fontSize: 15.5 }}>Blockers</h3>
        {blocked.length === 0 ? <ShieldCheck size={16} style={{ color: "var(--green)" }} /> : <TriangleAlert size={16} style={{ color: "var(--red)" }} />}
      </div>
      {blocked.length === 0 ? (
        <div className="center" style={{ padding: "14px 0" }}>
          <div className="strong" style={{ color: "var(--green)" }}>No blockers</div>
          <div className="small muted mt-1">Everything is moving. Keep shipping.</div>
        </div>
      ) : (
        <div className="stack-sm">
          {blocked.map((t) => (
            <Link key={t.id} href={`/tasks/${t.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
              <span className="dot" style={{ background: "var(--red)" }} />
              <span className="row-grow">
                <span className="row-title">{t.title}</span>
                {t.description && <span className="row-sub" style={{ display: "block" }}>{truncate(t.description, 70)}</span>}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
