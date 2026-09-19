import Link from "next/link";
import { FileText } from "lucide-react";
import { db } from "@/lib/db";
import { DOC_KINDS, DOC_KIND_LABEL } from "@/lib/constants";
import { Empty } from "@/components/ui";
import { fileIconMeta } from "@/lib/icons";
import { formatBytes, relTime } from "@/utils";
import NewDocumentForm from "@/components/forms/NewDocumentForm";

export const dynamic = "force-dynamic";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const docs = await db.document.findMany({
    where: kind && DOC_KINDS.includes(kind as never) ? { kind } : undefined,
    include: { projectLinks: { include: { project: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const projects = await db.project.findMany({ select: { id: true, name: true, key: true }, orderBy: { name: "asc" } });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-sub">{docs.length} documents across your workspace</p>
        </div>
        <NewDocumentForm projects={projects} />
      </div>

      <div className="row wrap" style={{ gap: 6 }}>
        <Link href="/documents" className={`chip chip-btn ${!kind ? "on" : ""}`}>All</Link>
        {DOC_KINDS.map((k) => (
          <Link key={k} href={`/documents?kind=${k}`} className={`chip chip-btn ${kind === k ? "on" : ""}`}>
            {DOC_KIND_LABEL[k]}
          </Link>
        ))}
      </div>

      <div className="grid-2">
        {docs.map((d) => {
          const meta = fileIconMeta(d.kind);
          const proj = d.projectLinks[0]?.project;
          return (
            <Link key={d.id} href={`/documents/${d.id}`} className="card card-hover card-pad" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span className={`file-ico ${meta.cls}`}>{meta.label}</span>
              <span className="row-grow" style={{ minWidth: 0 }}>
                <span className="row-title">{d.title}</span>
                <span className="row-sub" style={{ display: "block" }}>
                  {proj ? `${proj.name} · ` : ""}
                  {d.category ? `${d.category} · ` : ""}
                  {d.filePath ? (d.fileSize ? formatBytes(d.fileSize) : "file") : d.externalUrl ? d.externalUrl.replace(/^https?:\/\//, "").slice(0, 40) : d.kind.toLowerCase()}
                  {" · "}{relTime(d.updatedAt)}
                </span>
              </span>
              {proj && <span className="chip tiny">{proj.key}</span>}
            </Link>
          );
        })}
      </div>
      {docs.length === 0 && <Empty icon={<FileText size={20} />} title="No documents" sub="Upload files or save links to build your knowledge hub." />}
    </div>
  );
}
