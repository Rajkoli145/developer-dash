import Link from "next/link";
import { Handshake } from "lucide-react";
import { db } from "@/lib/db";
import { Empty } from "@/components/ui";
import { formatDateTime } from "@/utils";
import { generateHandoff } from "@/lib/actions";
import HandoffActions from "@/components/HandoffActions";

export const dynamic = "force-dynamic";

export default async function HandoffsPage() {
  const projects = await db.project.findMany({
    include: { handoffs: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
  const withHandoffs = projects.filter((p) => p.handoffs.length > 0);

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Handoffs</h1>
          <p className="page-sub">Structured snapshots you can hand to any engineer or AI agent.</p>
        </div>
      </div>

      <div className="grid-2">
        {projects.map((p) => {
          const h = p.handoffs[0];
          return (
            <section key={p.id} className="card card-pad">
              <div className="row spread wrap" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 10 }}>
                  <h3 className="card-title" style={{ fontSize: 16 }}>{p.name}</h3>
                  <span className="chip tiny">{p.key}</span>
                </div>
                <form action={generateHandoff}>
                  <input type="hidden" name="projectId" value={p.id} />
                  <button className="btn btn-outline btn-sm" type="submit">{h ? "Regenerate" : "Generate"}</button>
                </form>
              </div>
              {h ? (
                <div className="mt-2 stack-sm">
                  <div className="strong small">{h.title}</div>
                  <div className="tiny muted">{formatDateTime(h.createdAt)}</div>
                  {h.currentTask && <div className="small muted">Current task: <span className="strong" style={{ color: "var(--ink-2)" }}>{h.currentTask}</span></div>}
                  <div className="row mt-1" style={{ gap: 8 }}>
                    <HandoffActions handoffId={h.id} />
                    <Link className="btn btn-ghost btn-sm" href={`/projects/${p.id}?tab=handoffs`}>Details →</Link>
                  </div>
                </div>
              ) : (
                <div className="small muted mt-2">No handoff generated yet for this project.</div>
              )}
            </section>
          );
        })}
      </div>
      {projects.length === 0 && <Empty icon={<Handshake size={20} />} title="No projects" sub="Create a project first, then generate handoffs from it." />}
      {withHandoffs.length === 0 && projects.length > 0 && (
        <div className="empty">No handoffs yet — generate one above before switching context.</div>
      )}
    </div>
  );
}
