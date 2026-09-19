import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Trash2, Bot, Scale, CircleDot, History } from "lucide-react";
import { db } from "@/lib/db";
import { fileIconMeta } from "@/lib/icons";
import { formatBytes, formatDateTime, relTime } from "@/utils";
import { deleteDocument, detachDocument } from "@/lib/actions";
import { Empty } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await db.document.findUnique({
    where: { id },
    include: {
      uploader: true,
      versions: { orderBy: { version: "desc" } },
      projectLinks: { include: { project: true } },
      taskLinks: { include: { task: { include: { project: true } } } },
      sessionLinks: { include: { session: true } },
      decisionLinks: { include: { decision: true } },
    },
  });
  if (!doc) notFound();

  const meta = fileIconMeta(doc.kind);
  const project = doc.projectLinks[0]?.project;

  return (
    <div className="stack">
      <div className="row">
        <Link href={project ? `/projects/${project.id}?tab=documents` : "/documents"} className="card-link row" style={{ gap: 4 }}>
          <ArrowLeft size={13} /> {project ? `${project.name} · Documents` : "Documents"}
        </Link>
      </div>

      <header className="proj-banner">
        <div className="row spread wrap" style={{ gap: 14 }}>
          <div className="row" style={{ gap: 16, minWidth: 0 }}>
            <span className={`file-ico ${meta.cls}`} style={{ width: 52, height: 52, fontSize: 12, borderRadius: 15 }}>{meta.label}</span>
            <div style={{ minWidth: 0 }}>
              <h1 className="page-title" style={{ fontSize: 24 }}>{doc.title}</h1>
              <div className="small muted mt-1 row wrap" style={{ gap: 12 }}>
                {doc.category && <span className="chip tiny">{doc.category}</span>}
                <span>v{doc.version}</span>
                {doc.fileSize && <span>{formatBytes(doc.fileSize)}</span>}
                {doc.uploader && <span>Added by {doc.uploader.name}</span>}
                <span>Updated {relTime(doc.updatedAt)}</span>
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            {doc.externalUrl && (
              <a className="btn btn-outline btn-sm" href={doc.externalUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Open link
              </a>
            )}
            {doc.filePath && (
              <a className="btn btn-primary btn-sm" href={`/api/files/${doc.filePath.replace("uploads/", "")}`} target="_blank" rel="noreferrer">
                View file
              </a>
            )}
            <form action={deleteDocument}>
              <input type="hidden" name="id" value={doc.id} />
              <button className="btn btn-danger btn-sm" type="submit"><Trash2 size={14} /> Delete</button>
            </form>
          </div>
        </div>
      </header>

      <div className="grid-main-side">
        <div className="stack">
          {doc.description && (
            <section className="card card-pad">
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>About</h3></div>
              <p className="small" style={{ whiteSpace: "pre-wrap" }}>{doc.description}</p>
            </section>
          )}
          {doc.content && (
            <section className="card card-pad">
              <div className="card-head">
                <h3 className="card-title" style={{ fontSize: 15.5 }}>Content</h3>
                <span className="chip tiny"><History size={11} /> v{doc.version}</span>
              </div>
              <pre className="preblock">{doc.content}</pre>
            </section>
          )}

          <section className="card card-pad">
            <div className="card-head">
              <h3 className="card-title" style={{ fontSize: 15.5 }}>Attached to</h3>
              <span className="chip tiny">{doc.taskLinks.length + doc.sessionLinks.length + doc.decisionLinks.length} links</span>
            </div>
            <div className="stack-sm">
              {doc.taskLinks.map(({ task }) => (
                <Link key={task.id} href={`/tasks/${task.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <CircleDot size={15} className="muted" />
                  <span className="row-grow">
                    <span className="row-title">{task.title}</span>
                    <span className="row-sub" style={{ display: "block" }}>Task · {task.project.name}</span>
                  </span>
                </Link>
              ))}
              {doc.sessionLinks.map(({ session }) => (
                <Link key={session.id} href={`/sessions/${session.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <Bot size={15} className="muted" />
                  <span className="row-grow">
                    <span className="row-title">{session.title}</span>
                    <span className="row-sub" style={{ display: "block" }}>AI session</span>
                  </span>
                </Link>
              ))}
              {doc.decisionLinks.map(({ decision }) => (
                <div key={decision.id} className="row-item" style={{ border: "1px solid var(--line)" }}>
                  <Scale size={15} className="muted" />
                  <span className="row-grow">
                    <span className="row-title">{decision.title}</span>
                    <span className="row-sub" style={{ display: "block" }}>Decision</span>
                  </span>
                </div>
              ))}
              {doc.taskLinks.length + doc.sessionLinks.length + doc.decisionLinks.length === 0 && (
                <Empty title="Not linked yet" sub="Attach this document from a task or AI session." />
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card card-pad">
            <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Versions</h3></div>
            <div className="timeline">
              {doc.versions.map((v) => (
                <div key={v.id} className="tl-item">
                  <span className="tl-dot" />
                  <div className="tl-time">v{v.version} · {formatDateTime(v.createdAt)}</div>
                  {v.note && <div className="tl-text small">{v.note}</div>}
                </div>
              ))}
            </div>
          </section>
          {project && (
            <section className="card card-pad">
              <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Project</h3></div>
              <Link href={`/projects/${project.id}`} className="row-item" style={{ border: "1px solid var(--line)" }}>
                <span className="row-grow">
                  <span className="row-title">{project.name}</span>
                  <span className="row-sub" style={{ display: "block" }}>{project.key}</span>
                </span>
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
