import Link from "next/link";
import { db } from "@/lib/db";
import { TASK_STATUSES, TASK_STATUS_LABEL, PRIORITY_CLASS } from "@/lib/constants";
import { StatusBadge, ProgressBar, Empty } from "@/components/ui";
import { dueLabel } from "@/utils";
import NewTaskForm from "@/components/forms/NewTaskForm";

export default async function TasksTab({ project }: { project: { id: string; color: string } }) {
  const tasks = await db.task.findMany({
    where: { projectId: project.id },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { documents: true, sessions: true, decisions: true } } },
  });

  const done = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="stack">
      <div className="card card-pad">
        <div className="row spread wrap">
          <div className="row" style={{ gap: 14 }}>
            <div className="strong" style={{ fontSize: 15 }}>{done} / {tasks.length} done</div>
            <div style={{ width: 220 }}><ProgressBar value={progress} cls="p-green" /></div>
          </div>
          <NewTaskForm projectId={project.id} />
        </div>
      </div>

      <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14 }}>
        {TASK_STATUSES.map((status) => {
          const list = tasks.filter((t) => t.status === status);
          return (
            <section key={status}>
              <div className="row mb-2" style={{ gap: 8 }}>
                <StatusBadge status={status} />
                <span className="tiny muted strong">{list.length}</span>
              </div>
              <div className="stack-sm">
                {list.map((t) => (
                  <Link key={t.id} href={`/tasks/${t.id}`} className="card card-hover" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="row spread">
                      <span className={`badge badge-dot ${PRIORITY_CLASS[t.priority]}`}>{t.priority.toLowerCase()}</span>
                      <span className="tiny muted">{dueLabel(t.dueDate) ?? ""}</span>
                    </div>
                    <div className="strong small" style={{ fontSize: 13.5 }}>{t.title}</div>
                    {(t._count.documents > 0 || t._count.sessions > 0) && (
                      <div className="row tiny muted" style={{ gap: 10 }}>
                        {t._count.documents > 0 && <span>📄 {t._count.documents}</span>}
                        {t._count.sessions > 0 && <span>🤖 {t._count.sessions}</span>}
                        {t._count.decisions > 0 && <span>⚖️ {t._count.decisions}</span>}
                      </div>
                    )}
                  </Link>
                ))}
                {list.length === 0 && <div className="tiny muted" style={{ padding: "4px 2px 10px" }}>Nothing {TASK_STATUS_LABEL[status].toLowerCase()}.</div>}
              </div>
            </section>
          );
        })}
      </div>
      {tasks.length === 0 && <Empty title="No tasks yet" sub="Create the first task for this project." />}
    </div>
  );
}
