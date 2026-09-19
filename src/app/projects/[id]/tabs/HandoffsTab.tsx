import { db } from "@/lib/db";
import { Empty } from "@/components/ui";
import { formatDateTime, lines } from "@/utils";
import { generateHandoff } from "@/lib/actions";
import HandoffActions from "@/components/HandoffActions";

export default async function HandoffsTab({ project }: { project: { id: string; name: string } }) {
  const handoffs = await db.handoff.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="stack">
      <div className="card card-pad">
        <div className="row spread wrap">
          <div>
            <div className="strong" style={{ fontSize: 15 }}>Generate handoff</div>
            <div className="small muted">
              Snapshot the current state — objective, tasks, decisions, files — ready to hand to another agent or engineer.
            </div>
          </div>
          <form action={generateHandoff}>
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" className="btn btn-primary">Generate handoff</button>
          </form>
        </div>
      </div>

      <div className="stack">
        {handoffs.map((h) => {
          const blockers = lines(h.blockers);
          const clean = !(blockers.length === 1 && blockers[0].toLowerCase() === "none");
          return (
            <section key={h.id} className="card card-pad">
              <div className="row spread wrap" style={{ gap: 8 }}>
                <div>
                  <h3 className="card-title" style={{ fontSize: 16 }}>{h.title}</h3>
                  <div className="tiny muted mt-1">{formatDateTime(h.createdAt)}</div>
                </div>
                <HandoffActions handoffId={h.id} />
              </div>
              <div className="grid-2 mt-2">
                {h.objective && <Sec label="Current objective" body={h.objective} />}
                {h.currentTask && <Sec label="Current task" body={h.currentTask} />}
                {h.completed && <Sec label="Completed work" body={h.completed} list />}
                {h.inProgress && <Sec label="In progress" body={h.inProgress} list />}
                {h.nextSteps && <Sec label="Next steps" body={h.nextSteps} list />}
                {clean && <Sec label="Blockers" body={h.blockers!} list danger />}
                {h.decisions && <Sec label="Decisions" body={h.decisions} list />}
                {h.filesChanged && <Sec label="Files changed" body={h.filesChanged} list mono />}
                {h.testStatus && <Sec label="Test status" body={h.testStatus} />}
                {h.openQuestions && <Sec label="Open questions" body={h.openQuestions} />}
              </div>
            </section>
          );
        })}
        {handoffs.length === 0 && <Empty title="No handoffs yet" sub="Generate one before switching context — your future self will thank you." />}
      </div>
    </div>
  );
}

function Sec({ label, body, list = false, mono = false, danger = false }: { label: string; body: string; list?: boolean; mono?: boolean; danger?: boolean }) {
  const items = list ? lines(body) : [body];
  return (
    <div>
      <div className="tiny strong muted" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <ul className="small mt-1" style={{ margin: "6px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 3 }}>
        {items.map((it, i) => (
          <li key={i} className={mono ? "mono" : ""} style={danger ? { color: "var(--red)" } : undefined}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
