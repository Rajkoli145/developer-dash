import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { Empty } from "@/components/ui";
import { fileIconMeta } from "@/lib/icons";
import { formatBytes, relTime } from "@/utils";
import NewDocumentForm from "@/components/forms/NewDocumentForm";
import NewLinkForm from "@/components/forms/NewLinkForm";

export default async function DocumentsTab({ project }: { project: { id: string } }) {
  const links = await db.projectLink.findMany({ where: { projectId: project.id }, orderBy: { createdAt: "desc" } });
  const docs = await db.projectDocument.findMany({
    where: { projectId: project.id },
    include: { document: true },
    orderBy: { documentId: "asc" },
  });

  const documents = docs.map((d) => d.document);

  return (
    <div className="stack">
      <div className="card card-pad">
        <div className="row spread wrap">
          <div>
            <div className="strong" style={{ fontSize: 15 }}>{documents.length} documents</div>
            <div className="small muted">Specs, contracts and notes for this project.</div>
          </div>
          <NewDocumentForm projectId={project.id} />
        </div>
      </div>

      <div className="grid-2">
        {documents.map((d) => {
          const meta = fileIconMeta(d.kind);
          return (
            <Link key={d.id} href={`/documents/${d.id}`} className="card card-hover card-pad" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span className={`file-ico ${meta.cls}`}>{meta.label}</span>
              <span className="row-grow" style={{ minWidth: 0 }}>
                <span className="row-title">{d.title}</span>
                <span className="row-sub" style={{ display: "block" }}>
                  {d.category ? `${d.category} · ` : ""}
                  {d.filePath ? (d.fileSize ? formatBytes(d.fileSize) : "file") : d.externalUrl ? "external link" : d.kind.toLowerCase()}
                  {" · "}{relTime(d.updatedAt)}
                </span>
              </span>
              {d.externalUrl && <ExternalLink size={14} className="muted" />}
            </Link>
          );
        })}
      </div>
      {documents.length === 0 && <Empty title="No documents yet" sub="Upload specs, contracts and notes so they stay with the project." />}

      <section className="card card-pad">
        <div className="card-head">
          <h3 className="card-title" style={{ fontSize: 15.5 }}>Links &amp; repositories</h3>
          <span className="chip tiny">{links.length}</span>
        </div>
        <div className="stack-sm">
          {links.map((l) => (
            <div key={l.id} className="row-item" style={{ border: "1px solid var(--line)" }}>
              <span className="chip tiny">{l.kind.toLowerCase()}</span>
              <span className="row-grow">
                <a className="row-title" href={l.url} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>{l.label}</a>
                <span className="row-sub filepath" style={{ display: "block" }}>{l.url}</span>
              </span>
              <a className="btn btn-ghost btn-icon" href={l.url} target="_blank" rel="noreferrer" aria-label="Open link"><ExternalLink size={15} /></a>
            </div>
          ))}
          {links.length === 0 && <div className="small muted">No links saved yet.</div>}
        </div>
        <NewLinkForm projectId={project.id} />
      </section>
    </div>
  );
}
