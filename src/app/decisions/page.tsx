import Link from "next/link";
import { Scale } from "lucide-react";
import { db } from "@/lib/db";
import { GenericBadge, Empty } from "@/components/ui";
import { formatDate } from "@/utils";
import NewDecisionForm from "@/components/forms/NewDecisionForm";

export const dynamic = "force-dynamic";

const STATUSES = ["PROPOSED", "ACCEPTED", "SUPERSEDED", "REJECTED"] as const;

export default async function DecisionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const decisions = await db.decision.findMany({
    where: status ? { status } : undefined,
    include: { projectLinks: { include: { project: true } } },
    orderBy: { decidedAt: "desc" },
  });
  const projects = await db.project.findMany({ select: { id: true, name: true, key: true }, orderBy: { name: "asc" } });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Decisions</h1>
          <p className="page-sub">{decisions.length} architecture decisions recorded</p>
        </div>
        <NewDecisionForm projects={projects} />
      </div>

      <div className="row wrap" style={{ gap: 6 }}>
        <Link href="/decisions" className={`chip chip-btn ${!status ? "on" : ""}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/decisions?status=${s}`} className={`chip chip-btn ${status === s ? "on" : ""}`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <div className="stack">
        {decisions.map((d) => {
          const project = d.projectLinks[0]?.project;
          return (
            <section key={d.id} className="card card-pad card-hover">
              <div className="row spread wrap" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 10 }}>
                  <h3 className="card-title" style={{ fontSize: 16 }}>{d.title}</h3>
                  {project && <Link className="chip tiny" href={`/projects/${project.id}`}>{project.key}</Link>}
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <GenericBadge value={d.status} />
                  <span className="tiny muted">{formatDate(d.decidedAt)}</span>
                </div>
              </div>
              <div className="grid-2 mt-2">
                <Field label="Decision" body={d.decision} />
                {d.reason && <Field label="Reason" body={d.reason} />}
                {d.context && <Field label="Context" body={d.context} />}
                {d.alternatives && <Field label="Alternatives" body={d.alternatives} />}
                {d.consequences && <Field label="Consequences" body={d.consequences} />}
              </div>
            </section>
          );
        })}
        {decisions.length === 0 && <Empty icon={<Scale size={20} />} title="No decisions found" sub="Record the why behind your architecture." />}
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
