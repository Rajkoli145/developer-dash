import { db } from "@/lib/db";
import { GenericBadge, Empty } from "@/components/ui";
import { formatDate } from "@/utils";
import NewDecisionForm from "@/components/forms/NewDecisionForm";

export default async function DecisionsTab({ project }: { project: { id: string } }) {
  const links = await db.projectDecision.findMany({
    where: { projectId: project.id },
    include: { decision: true },
    orderBy: { decisionId: "desc" },
  });

  return (
    <div className="stack">
      <div className="card card-pad">
        <div className="row spread wrap">
          <div>
            <div className="strong" style={{ fontSize: 15 }}>{links.length} decisions</div>
            <div className="small muted">The architectural story of this project, decision by decision.</div>
          </div>
          <NewDecisionForm projectId={project.id} />
        </div>
      </div>

      <div className="stack">
        {links.map(({ decision }) => (
          <section key={decision.id} className="card card-pad">
            <div className="row spread wrap" style={{ gap: 8 }}>
              <h3 className="card-title" style={{ fontSize: 16 }}>{decision.title}</h3>
              <div className="row" style={{ gap: 8 }}>
                <GenericBadge value={decision.status} />
                <span className="tiny muted">{formatDate(decision.decidedAt)}</span>
              </div>
            </div>
            <div className="grid-2 mt-2">
              <Field label="Decision" body={decision.decision} />
              {decision.reason && <Field label="Reason" body={decision.reason} />}
              {decision.context && <Field label="Context" body={decision.context} />}
              {decision.alternatives && <Field label="Alternatives considered" body={decision.alternatives} />}
              {decision.consequences && <Field label="Consequences" body={decision.consequences} />}
            </div>
          </section>
        ))}
        {links.length === 0 && <Empty title="No decisions recorded" sub="Capture the why behind your architecture choices." />}
      </div>
    </div>
  );
}

function Field({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="tiny strong muted" style={{ textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <p className="small mt-1" style={{ whiteSpace: "pre-wrap" }}>{body}</p>
    </div>
  );
}
