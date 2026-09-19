import Link from "next/link";
import { Search } from "lucide-react";
import { globalSearch } from "@/lib/search";
import { FolderKanban, CircleDot, FileText, Bot, MessageSquareCode, Scale, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  project: FolderKanban, task: CircleDot, document: FileText,
  session: Bot, prompt: MessageSquareCode, decision: Scale, handoff: Handshake,
};
const CLS: Record<string, string> = {
  project: "ico-blue", task: "ico-green", document: "ico-purple",
  session: "ico-orange", prompt: "ico-gold", decision: "ico-teal", handoff: "ico-red",
};
const LABELS: Record<string, string> = {
  project: "Project", task: "Task", document: "Document",
  session: "AI Session", prompt: "Prompt", decision: "Decision", handoff: "Handoff",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const hits = q ? await globalSearch(q) : [];

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-sub">{q ? `${hits.length} results for “${q}”` : "Search across everything in your workspace."}</p>
        </div>
        <form action="/search" className="row" style={{ gap: 6 }}>
          <input name="q" className="input" defaultValue={q ?? ""} placeholder="Search…" style={{ width: 280 }} autoFocus />
          <button className="btn btn-primary" type="submit"><Search size={14} /> Search</button>
        </form>
      </div>

      <section className="card">
        {hits.map((h) => {
          const Icon = ICONS[h.type] ?? FolderKanban;
          return (
            <Link key={h.type + h.id} href={h.href} className="row-item" style={{ borderRadius: 0, borderBottom: "1px solid var(--line)" }}>
              <span className={`stat-ico ${CLS[h.type] ?? "ico-blue"}`}><Icon size={15} /></span>
              <span className="row-grow">
                <span className="row-title">{h.title}</span>
                <span className="row-sub" style={{ display: "block" }}>{LABELS[h.type] ?? h.type} · {h.sub}</span>
              </span>
              {h.projectKey && <span className="chip tiny">{h.projectKey}</span>}
            </Link>
          );
        })}
        {q && hits.length === 0 && <div className="empty">No matches for “{q}”. Try another term.</div>}
        {!q && <div className="empty">Type a query above — projects, tasks, documents, sessions, prompts, decisions, handoffs.</div>}
      </section>
    </div>
  );
}
