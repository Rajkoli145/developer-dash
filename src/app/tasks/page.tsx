import Link from "next/link";
import { db } from "@/lib/db";
import { TASK_STATUSES, TASK_STATUS_LABEL, PRIORITY_CLASS } from "@/lib/constants";
import { StatusBadge, Empty } from "@/components/ui";
import { cn, dueLabel, isToday, relTime } from "@/utils";
import NewTaskForm from "@/components/forms/NewTaskForm";
import { CircleDot } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const [tasks, projects] = await Promise.all([
    db.task.findMany({
      where: status && TASK_STATUSES.includes(status as never) ? { status } : undefined,
      include: { project: true },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    }),
    db.project.findMany({ select: { id: true, name: true, key: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-sub">{tasks.length} tasks {status ? `· ${TASK_STATUS_LABEL[status] ?? status}` : "· all statuses"}</p>
        </div>
        <NewTaskForm projects={projects} />
      </div>

      <div className="row wrap" style={{ gap: 6 }}>
        <Link href="/tasks" className={`chip chip-btn ${!status ? "on" : ""}`}>All</Link>
        {TASK_STATUSES.map((s) => (
          <Link key={s} href={`/tasks?status=${s}`} className={`chip chip-btn ${status === s ? "on" : ""}`}>
            {TASK_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {tasks.length === 0 && <Empty icon={<CircleDot size={20} />} title="No tasks found" sub="Try a different filter or create a task." />}

      <section className="card">
        {tasks.map((t) => {
          const overdue = t.dueDate && t.status !== "DONE" && !isToday(t.dueDate) && new Date(t.dueDate) < new Date();
          return (
            <Link key={t.id} href={`/tasks/${t.id}`} className="row-item" style={{ borderRadius: 0, borderBottom: "1px solid var(--line)" }}>
              <span className={`dot`} style={{ background: t.status === "DONE" ? "var(--green)" : t.status === "BLOCKED" ? "var(--red)" : t.status === "IN_PROGRESS" ? "var(--blue)" : "var(--line-2)" }} />
              <span className="row-grow">
                <span className="row-title" style={t.status === "DONE" ? { textDecoration: "line-through", color: "var(--ink-3)" } : undefined}>
                  {t.title}
                </span>
                <span className="row-sub" style={{ display: "block" }}>{t.project.name}</span>
              </span>
              {t.dueDate && (
                <span className={cn("tiny", overdue ? "strong" : "muted")} style={overdue ? { color: "var(--red)" } : undefined}>
                  {dueLabel(t.dueDate)}
                </span>
              )}
              <span className={`badge badge-dot ${PRIORITY_CLASS[t.priority]}`} style={{ display: undefined }}>{t.priority.toLowerCase()}</span>
              <StatusBadge status={t.status} />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
