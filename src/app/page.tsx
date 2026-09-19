import Link from "next/link";
import {
  ArrowUpRight, Bot, FileText, ListChecks, ShieldAlert, Sparkles, MessageSquareCode, CircleDot,
  FolderKanban, Scale, Handshake,
} from "lucide-react";
import { dashboardData } from "@/lib/data";
import { currentUser } from "@/lib/actions";
import { AGENT_LABEL, agentClass } from "@/lib/constants";
import { ACTIVITY_ICON } from "@/lib/icons";
import { cn, dueLabel, relTime, truncate } from "@/utils";
import { Ring, StatCard, StatusBadge, ProgressBar, SectionHead, Empty } from "@/components/ui";
import NewProjectForm from "@/components/NewProjectForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ projects, activeTasks, recentSessions, recentActivity, nextActions, stats }, user] = await Promise.all([
    dashboardData(),
    currentUser(),
  ]);

  // Hero: the most active project (most tasks, then most recent), preferring ACTIVE.
  const primary =
    [...projects].sort(
      (a, b) =>
        (statusRank(a.status) - statusRank(b.status)) ||
        b.taskTotal - a.taskTotal ||
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0] ?? projects[0];
  const rest = projects.filter((p) => p.id !== primary?.id).slice(0, 7);

  return (
    <div className="stack">
      <div className="row spread wrap">
        <div>
          <h1 className="page-title">{greetingLine(user.name)}</h1>
          <p className="page-sub">Here&apos;s what&apos;s happening across your projects.</p>
        </div>
        <NewProjectForm />
      </div>

      <div className="stat-row rise">
        <StatCard label="Active Projects" value={stats.activeProjects} icon={<FolderKanban size={16} />} cls="ico-blue" hint={`${projects.length} total`} />
        <StatCard label="Tasks In Progress" value={stats.tasksInProgress} icon={<ListChecks size={16} />} cls="ico-green" hint="Across all projects" />
        <StatCard label="Open Blockers" value={stats.blockers} icon={<ShieldAlert size={16} />} cls="ico-red" hint={stats.blockers ? "Needs attention" : "All clear"} />
        <StatCard label="Documents" value={stats.documents} icon={<FileText size={16} />} cls="ico-purple" hint="In your workspace" />
        <StatCard label="AI Sessions" value={stats.sessions} icon={<Bot size={16} />} cls="ico-orange" hint="Logged so far" />
      </div>

      <section className="mt-1">
        <SectionHead title="Active Projects" href="/projects" />
        {!primary && (
          <div className="empty" style={{ padding: "48px 24px" }}>
            <div className="empty-ico"><FolderKanban size={20} /></div>
            <div className="strong" style={{ color: "var(--ink-2)" }}>No projects yet</div>
            <div className="small mt-1">Create your first project to start building context — tasks, documents, AI sessions and handoffs all live inside it.</div>
            <div className="mt-2"><NewProjectForm trigger="Create your first project" /></div>
          </div>
        )}
        <div className="hero-grid">
          {primary && (
            <Link href={`/projects/${primary.id}`} className="ink-card card-hover hero-project rise d1">
              <div className="row spread">
                <span className="hero-kicker muted">{primary.role ?? "Personal project"}</span>
                <span className="pill-glass">{primary.key}</span>
              </div>
              <div className="hero-title">{primary.name}</div>
              <p className="hero-role muted clamp-2" style={{ maxWidth: 420 }}>{primary.description}</p>
              <div className="hero-foot">
                <div>
                  <div className="hero-meta muted">{primary.objectiveLabel ?? "Current objective"}</div>
                  <div className="strong" style={{ fontSize: 14.5 }}>{primary.objective ?? "—"}</div>
                </div>
                <span className="pill-glass">
                  Updated {relTime(primary.updatedAt)} <ArrowUpRight size={13} />
                </span>
              </div>
            </Link>
          )}

          {primary && (
            <Link href={`/projects/${primary.id}`} className="card card-hover card-pad rise d2" style={{ display: "grid", placeItems: "center" }}>
              <Ring value={primary.progress} size={168} stroke={14} color={primary.color}>
                <div>
                  <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{primary.progress}%</div>
                  <div className="muted tiny strong" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>Week progress</div>
                </div>
              </Ring>
              <div className="center mt-2">
                <div className="strong">{primary.objective ?? "Current objective"}</div>
                <div className="small muted">{primary.taskDone} / {primary.taskTotal} tasks completed</div>
              </div>
            </Link>
          )}

          {primary && (
            <div className="card card-pad rise d3" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card-head" style={{ marginBottom: 0 }}>
                <h3 className="card-title" style={{ fontSize: 15.5 }}>Next actions</h3>
                <span className="chip tiny">{primary.key}</span>
              </div>
              {(nextActions.length ? nextActions : activeTasks).slice(0, 4).map((t) => {
                const due = dueLabel(t.dueDate);
                return (
                  <Link key={t.id} href={`/tasks/${t.id}`} className="row-item" style={{ padding: "10px 12px" }}>
                    <span className={`dot ${t.status === "IN_PROGRESS" ? "ico-blue" : ""}`} style={{ background: t.status === "IN_PROGRESS" ? "var(--blue)" : "var(--line-2)" }} />
                    <span className="row-grow">
                      <span className="row-title">{truncate(t.title, 42)}</span>
                      <span className="row-sub" style={{ display: "block" }}>
                        {t.project.key}{due ? ` · due ${due}` : ""}
                      </span>
                    </span>
                    <StatusBadge status={t.status} />
                  </Link>
                );
              })}
              {!nextActions.length && !activeTasks.length && <Empty title="Nothing queued" sub="Create a task to get going." />}
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <div className="hscroll mt-2">
            {rest.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="proj-mini card-hover">
                <div className="row spread">
                  <span className="chip">{p.key}</span>
                  <span className={`badge badge-dot ${p.status === "ACTIVE" ? "b-active" : "b-archived"}`}>{p.status.toLowerCase()}</span>
                </div>
                <div>
                  <div className="strong" style={{ fontSize: 15.5 }}>{p.name}</div>
                  <div className="small muted clip">{p.role ?? p.description ?? ""}</div>
                </div>
                <ProgressBar value={p.progress} cls={p.color === "teal" || p.color === "gold" ? "p-blue" : `p-${p.color}`} />
                <div className="row spread small muted">
                  <span>{p.taskDone}/{p.taskTotal} tasks</span>
                  <span>{p.docCount} docs · {p.sessionCount} sessions</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-2">
        <SectionHead title="Current Work" href="/tasks" />
        <div className="hscroll">
          {activeTasks.map((t) => (
            <Link key={t.id} href={`/tasks/${t.id}`} className="card card-hover card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="row spread">
                <span className="chip">{t.project.key}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="strong" style={{ fontSize: 15.5, letterSpacing: "-0.01em" }}>{truncate(t.title, 48)}</div>
              {t.description && <p className="small muted clamp-2">{t.description}</p>}
              <div className="row spread small muted mt-1">
                <span>{dueLabel(t.dueDate) ? `Due ${dueLabel(t.dueDate)}` : "No due date"}</span>
                <span className="strong" style={{ color: t.priority === "URGENT" || t.priority === "HIGH" ? "var(--red)" : "var(--ink-3)" }}>
                  {t.priority.toLowerCase()}
                </span>
              </div>
            </Link>
          ))}
          {!activeTasks.length && <div style={{ gridColumn: "1 / -1" }}><Empty icon={<CircleDot size={20} />} title="No active tasks" sub="Tasks in progress, blocked or in review will appear here." /></div>}
        </div>
      </section>

      <div className="grid-main-side mt-2">
        <section className="card card-pad">
          <div className="card-head">
            <h3 className="card-title">Recent AI Activity</h3>
            <Link className="card-link" href="/sessions">All sessions →</Link>
          </div>
          <div className="stack-sm">
            {recentSessions.map((s) => (
              <Link key={s.id} href={`/sessions/${s.id}`} className="row-item">
                <span className={`agent-badge ${agentClass(s.agent)}`}>{AGENT_LABEL[s.agent] ?? s.agent}</span>
                <span className="row-grow">
                  <span className="row-title">{s.title}</span>
                  <span className="row-sub" style={{ display: "block" }}>
                    {s.project ? `${s.project.name} · ` : ""}{s.summary ? truncate(s.summary, 60) : AGENT_LABEL[s.agent]}
                  </span>
                </span>
                <span className="small muted" style={{ flexShrink: 0 }}>{relTime(s.spentAt)}</span>
              </Link>
            ))}
            {!recentSessions.length && <Empty icon={<Bot size={20} />} title="No AI sessions yet" sub="Log your first agent session." />}
          </div>
        </section>

        <section className="card card-pad">
          <div className="card-head">
            <h3 className="card-title">Activity</h3>
            <Sparkles size={16} className="muted" />
          </div>
          <div className="timeline">
            {recentActivity.slice(0, 7).map((a) => (
              <div key={a.id} className="tl-item">
                <span className="tl-dot" style={{ fontSize: 9 }}>{ACTIVITY_ICON[a.kind] ?? "•"}</span>
                <div className="tl-time">{relTime(a.createdAt)}{a.project ? ` · ${a.project.name}` : ""}</div>
                <div className="tl-text">{a.message}</div>
              </div>
            ))}
            {!recentActivity.length && <Empty title="No activity yet" />}
          </div>
        </section>
      </div>

      <section className="grid-3 mt-2">
        <Link href="/prompts" className="tint-card tint-gold card-hover">
          <div className="row spread">
            <span className="stat-ico ico-gold"><MessageSquareCode size={16} /></span>
            <ArrowUpRight size={16} className="muted" />
          </div>
          <div className="strong mt-2" style={{ fontSize: 16 }}>Prompt Library</div>
          <div className="small muted mt-1">{stats.prompts} reusable prompts ready to paste into any agent.</div>
        </Link>
        <Link href="/decisions" className="tint-card tint-teal card-hover">
          <div className="row spread">
            <span className="stat-ico ico-teal"><Scale size={16} /></span>
            <ArrowUpRight size={16} className="muted" />
          </div>
          <div className="strong mt-2" style={{ fontSize: 16 }}>Decision Log</div>
          <div className="small muted mt-1">Capture the why behind your architecture, forever.</div>
        </Link>
        <Link href="/handoffs" className="tint-card tint-purple card-hover">
          <div className="row spread">
            <span className="stat-ico ico-purple"><Handshake size={16} /></span>
            <ArrowUpRight size={16} className="muted" />
          </div>
          <div className="strong mt-2" style={{ fontSize: 16 }}>Handoffs &amp; Context Packs</div>
          <div className="small muted mt-1">Switch projects or AI agents without losing a thread.</div>
        </Link>
      </section>
    </div>
  );
}

function statusRank(s: string): number {
  return s === "ACTIVE" ? 0 : s === "ARCHIVED" ? 2 : 1;
}

function greetingLine(name: string) {
  const h = new Date().getHours();
  const g = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${g}, ${name.split(/\s+/)[0]}`;
}
