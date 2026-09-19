import Link from "next/link";
import { Bot } from "lucide-react";
import { db } from "@/lib/db";
import { AGENTS, AGENT_LABEL, agentClass, RESULT_CLASS } from "@/lib/constants";
import { Empty, GenericBadge } from "@/components/ui";
import { formatDateTime, lines, truncate } from "@/utils";
import NewSessionForm from "@/components/forms/NewSessionForm";

export const dynamic = "force-dynamic";

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ agent?: string }> }) {
  const { agent } = await searchParams;
  const sessions = await db.aiSession.findMany({
    where: agent && AGENTS.includes(agent as never) ? { agent } : undefined,
    include: { project: true },
    orderBy: { spentAt: "desc" },
  });
  const projects = await db.project.findMany({ select: { id: true, name: true, key: true }, orderBy: { name: "asc" } });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">AI Sessions</h1>
          <p className="page-sub">{sessions.length} sessions logged across every agent</p>
        </div>
        <NewSessionForm projects={projects} />
      </div>

      <div className="row wrap" style={{ gap: 6 }}>
        <Link href="/sessions" className={`chip chip-btn ${!agent ? "on" : ""}`}>All</Link>
        {AGENTS.map((a) => (
          <Link key={a} href={`/sessions?agent=${a}`} className={`chip chip-btn ${agent === a ? "on" : ""}`}>
            {AGENT_LABEL[a]}
          </Link>
        ))}
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
                <div className="tiny muted mt-1">{s.project ? `${s.project.name} · ` : ""}{formatDateTime(s.spentAt)}</div>
              </div>
              {s.summary && <p className="small muted clamp-2">{s.summary}</p>}
              {files.length > 0 && (
                <div className="row wrap" style={{ gap: 4 }}>
                  {files.slice(0, 3).map((f) => <span key={f} className="filepath">{truncate(f, 32)}</span>)}
                  {files.length > 3 && <span className="tiny muted">+{files.length - 3}</span>}
                </div>
              )}
              {s.nextStep && <div className="small" style={{ color: "var(--blue)" }}><span className="strong">Next:</span> {truncate(s.nextStep, 64)}</div>}
            </Link>
          );
        })}
      </div>
      {sessions.length === 0 && <Empty icon={<Bot size={20} />} title="No sessions" sub="Log what your AI agents do so nothing gets lost between context switches." />}
    </div>
  );
}
