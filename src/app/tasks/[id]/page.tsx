import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Bot, Scale, Paperclip } from "lucide-react";
import { db } from "@/lib/db";
import { AGENT_LABEL, agentClass, RESULT_CLASS, STATUS_CLASS, PRIORITIES, TASK_STATUSES, TASK_STATUS_LABEL } from "@/lib/constants";
import { StatusBadge, GenericBadge } from "@/components/ui";
import { formatDateTime, dueLabel, relTime } from "@/utils";
import { updateTask, attachDocument, detachDocument, setTaskStatus } from "@/lib/actions";
import AttachDocPicker from "@/components/AttachDocPicker";

export const dynamic = "force-dynamic";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await db.task.findUnique({
    where: { id },
    include: {
      project: true,
      assignee: true,
      documents: { include: { document: true } },
      sessions: { include: { session: true } },
      decisions: { include: { decision: true } },
      promptUsages: { include: { prompt: true }, take: 5, orderBy: { usedAt: "desc" } },
    },
  });
  if (!task) notFound();

  const projectDocs = await db.document.findMany({
    where: { projectLinks: { some: { projectId: task.projectId } } },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  const attachedIds = new Set(task.documents.map((d) => d.document.id));
  const unattached = projectDocs.filter((d) => !attachedIds.has(d.id));

  return (
    <div className="stack">
      <div className="row">
        <Link href={`/projects/${task.projectId}?tab=tasks`} className="card-link row" style={{ gap: 4 }}>
          <ArrowLeft size={13} /> {task.project.name} · Tasks
        </Link>
      </div>

      <header className="proj-banner">
        <div className="row spread wrap" style={{ gap: 14 }}>
          <div style={{ minWidth: 260, flex: 1 }}>
            <div className="row wrap" style={{ gap: 10 }}>
              <h1 className="page-title" style={{ fontSize: 26 }}>{task.title}</h1>
              <StatusBadge status={task.status} />
            </div>
            <div className="small muted mt-1 row wrap" style={{ gap: 12 }}>
              <span className="chip tiny">{task.project.key}</span>
              <span>Due: <span className="strong" style={{ color: "var(--ink-2)" }}>{dueLabel(task.dueDate) ?? "no date"}</span></span>
              <span>Priority: <span className="strong" style={{ color: "var(--ink-2)" }}>{task.priority.toLowerCase()}</span></span>
              {task.assignee && <span>Assignee: {task.assignee.name}</span>}
              <span>Created {relTime(task.createdAt)}</span>
            </div>
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <form action={setTaskStatus} className="row" style={{ gap: 6 }}>
              <input type="hidden" name="id" value={task.id} />
              <select name="status" className="select" defaultValue={task.status} style={{ width: 150 }}>
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>)}
              </select>
              <button className="btn btn-outline btn-sm" type="submit">Set status</button>
            </form>
            <form action={updateTask} className="row" style={{ gap: 6 }}>
              <input type="hidden" name="id" value={task.id} />
              <input type="hidden" name="title" value={task.title} />
              <select name="priority" className="select" defaultValue={task.priority} style={{ width: 120 }}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
              <input type="date" name="dueDate" className="input" style={{ width: 150 }} defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""} />
              <button className="btn btn-outline btn-sm" type="submit">Update</button>
            </form>
          </div>
        </div>
      </header>

      <div className="grid-main-side">
        <div className="stack">
          {task.description && (
            <section className="card card-pad">
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Description</h3></div>
              <p className="small" style={{ whiteSpace: "pre-wrap" }}>{task.description}</p>
            </section>
          )}
          {task.notes && (
            <section className="card card-pad" style={{ background: "linear-gradient(150deg, var(--blue-soft), var(--card) 70%)" }}>
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Next action</h3></div>
              <p className="small strong" style={{ whiteSpace: "pre-wrap" }}>{task.notes}</p>
            </section>
          )}

          {/* Related documents */}
          <section className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ fontSize: 15.5 }}><span className="row" style={{ gap: 7 }}><FileText size={15} /> Related documents</span></h3>
              <span className="chip tiny">{task.documents.length}</span>
            </div>
            <div className="stack-sm">
              {task.documents.map(({ document }) => (
                <div key={document.id} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <span className="file-ico ico-blue" style={{ width: 32, height: 32, fontSize: 9 }}>{document.kind.slice(0, 3)}</span>
                  <span className="row-grow">
                    <Link className="row-title" href={`/documents/${document.id}`}>{document.title}</Link>
                    <span className="row-sub" style={{ display: "block" }}>{document.category ?? document.kind.toLowerCase()}</span>
                  </span>
                  <form action={detachDocument}>
                    <input type="hidden" name="documentId" value={document.id} />
                    <input type="hidden" name="targetType" value="task" />
                    <input type="hidden" name="targetId" value={task.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">Detach</button>
                  </form>
                </div>
              ))}
              {task.documents.length === 0 && <div className="small muted">No documents attached yet.</div>}
              {unattached.length > 0 && <AttachDocPicker documents={unattached} targetType="task" targetId={task.id} />}
            </div>
          </section>

          {/* Related AI sessions */}
          <section className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ fontSize: 15.5 }}><span className="row" style={{ gap: 7 }}><Bot size={15} /> AI sessions</span></h3>
              <span className="chip tiny">{task.sessions.length}</span>
            </div>
            <div className="stack-sm">
              {task.sessions.map(({ session }) => (
                <Link key={session.id} href={`/sessions/${session.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <span className={`agent-badge ${agentClass(session.agent)}`} style={{ width: 34, height: 34, fontSize: 10 }}>{AGENT_LABEL[session.agent] ?? session.agent}</span>
                  <span className="row-grow">
                    <span className="row-title">{session.title}</span>
                    <span className="row-sub" style={{ display: "block" }}>{formatDateTime(session.spentAt)}</span>
                  </span>
                  {session.result && <GenericBadge value={session.result} map={RESULT_CLASS} />}
                </Link>
              ))}
              {task.sessions.length === 0 && (
                <div className="small muted">
                  No sessions linked. Log one from the <Link className="card-link" href={`/projects/${task.projectId}?tab=sessions`}>project sessions tab →</Link>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          {/* Decisions */}
          <section className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ fontSize: 15.5 }}><span className="row" style={{ gap: 7 }}><Scale size={15} /> Decisions</span></h3>
              <span className="chip tiny">{task.decisions.length}</span>
            </div>
            <div className="stack-sm">
              {task.decisions.map(({ decision }) => (
                <div key={decision.id} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <span className="row-grow">
                    <span className="row-title">{decision.title}</span>
                    <span className="row-sub" style={{ display: "block" }}>{decision.status.toLowerCase()}</span>
                  </span>
                </div>
              ))}
              {task.decisions.length === 0 && <div className="small muted">No decisions linked to this task.</div>}
            </div>
          </section>

          {/* Prompts used */}
          {task.promptUsages.length > 0 && (
            <section className="card card-pad">
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Prompts used</h3></div>
              <div className="stack-sm">
                {task.promptUsages.map(({ prompt }) => (
                  <div key={prompt.id} className="row-item" style={{ border: "1px solid var(--line)" }}>
                    <span className="row-grow">
                      <span className="row-title">{prompt.name}</span>
                      <span className="row-sub" style={{ display: "block" }}>{prompt.category}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card card-pad">
            <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Status board</h3></div>
            <div className="stack-sm">
              {TASK_STATUSES.map((s) => (
                <Link key={s} href={`/projects/${task.projectId}?tab=tasks`} className="row-item" style={{ opacity: s === task.status ? 1 : 0.55 }}>
                  <span className={`badge badge-dot ${STATUS_CLASS[s]}`}>{TASK_STATUS_LABEL[s]}</span>
                  {s === task.status && <span className="tiny muted right">current</span>}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
