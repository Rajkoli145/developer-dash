import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { AGENT_LABEL, agentClass, RESULT_CLASS } from "@/lib/constants";
import { GenericBadge, Empty } from "@/components/ui";
import { formatDateTime, lines } from "@/utils";
import { deleteSession } from "@/lib/actions";
import AttachDocPicker from "@/components/AttachDocPicker";

export const dynamic = "force-dynamic";

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.aiSession.findUnique({
    where: { id },
    include: {
      project: true,
      taskLinks: { include: { task: true } },
      documents: { include: { document: true } },
    },
  });
  if (!session) notFound();

  const projectDocs = session.project
    ? await db.document.findMany({
        where: { projectLinks: { some: { projectId: session.project.id } } },
        select: { id: true, title: true },
      })
    : [];
  const attachedIds = new Set(session.documents.map((d) => d.document.id));
  const unattached = projectDocs.filter((d) => !attachedIds.has(d.id));

  return (
    <div className="stack">
      <div className="row">
        <Link href={session.project ? `/projects/${session.project.id}?tab=sessions` : "/sessions"} className="card-link row" style={{ gap: 4 }}>
          <ArrowLeft size={13} /> {session.project ? `${session.project.name} · AI Sessions` : "AI Sessions"}
        </Link>
      </div>

      <header className="proj-banner">
        <div className="row spread wrap" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 16 }}>
            <span className={`agent-badge ${agentClass(session.agent)}`} style={{ width: 52, height: 52, fontSize: 12, borderRadius: 15 }}>
              {AGENT_LABEL[session.agent] ?? session.agent}
            </span>
            <div>
              <h1 className="page-title" style={{ fontSize: 24 }}>{session.title}</h1>
              <div className="small muted mt-1 row wrap" style={{ gap: 12 }}>
                {session.project && <span className="chip tiny">{session.project.key}</span>}
                <span>{formatDateTime(session.spentAt)}</span>
                {session.result && <GenericBadge value={session.result} map={RESULT_CLASS} />}
              </div>
            </div>
          </div>
          <form action={deleteSession}>
            <input type="hidden" name="id" value={session.id} />
            <button className="btn btn-danger btn-sm" type="submit"><Trash2 size={14} /> Delete</button>
          </form>
        </div>
      </header>

      <div className="grid-main-side">
        <div className="stack">
          {session.goal && <Card label="Goal" body={session.goal} />}
          {session.prompt && <Card label="Prompt used" body={session.prompt} pre />}
          {session.summary && <Card label="Summary" body={session.summary} />}
          {session.problems && <Card label="Problems hit" body={session.problems} />}
        </div>
        <div className="stack">
          {session.actions && <Card label="Actions taken" body={session.actions} list />}
          {session.filesChanged && <Card label="Files changed" body={session.filesChanged} list mono />}
          {session.decisions && <Card label="Decisions made" body={session.decisions} />}
          {session.nextStep && (
            <section className="card card-pad" style={{ background: "linear-gradient(150deg, var(--blue-soft), var(--card) 70%)" }}>
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Next step</h3></div>
              <p className="small strong" style={{ whiteSpace: "pre-wrap" }}>{session.nextStep}</p>
            </section>
          )}
          <section className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ fontSize: 15.5 }}>Documents</h3>
              <span className="chip tiny">{session.documents.length}</span>
            </div>
            <div className="stack-sm">
              {session.documents.map(({ document }) => (
                <Link key={document.id} href={`/documents/${document.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <span className="row-grow"><span className="row-title">{document.title}</span></span>
                </Link>
              ))}
              {session.documents.length === 0 && <div className="small muted">No documents attached.</div>}
              {session.project && <AttachDocPicker documents={unattached} targetType="session" targetId={session.id} />}
            </div>
          </section>
          {session.taskLinks.length > 0 && (
            <section className="card card-pad">
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Related task</h3></div>
              {session.taskLinks.map(({ task }) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <span className="row-grow">
                    <span className="row-title">{task.title}</span>
                    <span className="row-sub" style={{ display: "block" }}>{task.status.toLowerCase()}</span>
                  </span>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ label, body, list = false, mono = false, pre = false }: { label: string; body: string; list?: boolean; mono?: boolean; pre?: boolean }) {
  return (
    <section className="card card-pad">
      <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>{label}</h3></div>
      {list ? (
        <ul className="small" style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {lines(body).map((l, i) => <li key={i} className={mono ? "mono" : ""}>{l}</li>)}
        </ul>
      ) : (
        <p className="small" style={pre ? { whiteSpace: "pre-wrap", fontFamily: "var(--mono)", fontSize: 12.5 } : { whiteSpace: "pre-wrap" }}>{body}</p>
      )}
    </section>
  );
}
