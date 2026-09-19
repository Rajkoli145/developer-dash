import Link from "next/link";
import { db } from "@/lib/db";
import { AGENT_LABEL, agentClass, RESULT_CLASS } from "@/lib/constants";
import { Empty, GenericBadge } from "@/components/ui";
import { formatDateTime, lines, truncate } from "@/utils";
import NewSessionForm from "@/components/forms/NewSessionForm";

export default async function SessionsTab({ project }: { project: { id: string } }) {
  const sessions = await db.aiSession.findMany({
    where: { projectId: project.id },
    orderBy: { spentAt: "desc" },
    include: { _count: { select: { documents: true } } },
  });
  const documents = await db.document.findMany({
    where: { projectLinks: { some: { projectId: project.id } } },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
  const tasks = await db.task.findMany({
    where: { projectId: project.id },
    select: { id: true, title: true, projectId: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="stack">
      <div className="card card-pad">
        <div className="row spread wrap">
          <div>
            <div className="strong" style={{ fontSize: 15 }}>{sessions.length} AI sessions</div>
            <div className="small muted">Every agent conversation, captured with its outcome.</div>
          </div>
          <NewSessionForm projectId={project.id} documents={documents} tasks={tasks} />
        </div>
      </div>

      <div className="grid-2">
        {sessions.map((s) => {
          const files = lines(s.filesChanged);
          return (
            <Link key={s.id} href={`/sessions/${s.id}`} className="card card-hover card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="row spread">
                <span className={`agent-badge ${agentClass(s.agent)}`}>{AGENT_LABEL[s.agent] ?? s.agent}</span>
                {s.result && <GenericBadge value={s.result} map={RESULT_CLASS} />}
              </div>
              <div>
                <div className="strong" style={{ fontSize: 15 }}>{s.title}</div>
                <div className="tiny muted mt-1">{formatDateTime(s.spentAt)}{s._count.documents > 0 ? ` · ${s._count.documents} docs` : ""}</div>
              </div>
              {s.summary && <p className="small muted clamp-2">{s.summary}</p>}
              {files.length > 0 && (
                <div className="row wrap" style={{ gap: 4 }}>
                  {files.slice(0, 3).map((f) => <span key={f} className="filepath">{truncate(f, 34)}</span>)}
                  {files.length > 3 && <span className="tiny muted">+{files.length - 3} more</span>}
                </div>
              )}
              {s.nextStep && (
                <div className="small" style={{ color: "var(--blue)" }}>
                  <span className="strong">Next:</span> {truncate(s.nextStep, 70)}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      {sessions.length === 0 && <Empty title="No sessions logged" sub="Log what your AI agents did so context is never lost." />}
    </div>
  );
}
