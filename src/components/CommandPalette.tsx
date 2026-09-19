"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban, CircleDot, FileText, Bot, MessageSquareCode, Scale, Handshake, Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Hit = {
  type: string;
  id: string;
  title: string;
  sub: string;
  projectKey?: string;
  projectName?: string;
  href: string;
};

type Ctx = { open: (initial?: string) => void };
const PaletteCtx = createContext<Ctx>({ open: () => {} });
export const usePalette = () => useContext(PaletteCtx);

const TYPE_META: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  project: { label: "Project", icon: FolderKanban, cls: "ico-blue" },
  task: { label: "Task", icon: CircleDot, cls: "ico-green" },
  document: { label: "Document", icon: FileText, cls: "ico-purple" },
  session: { label: "AI Session", icon: Bot, cls: "ico-orange" },
  prompt: { label: "Prompt", icon: MessageSquareCode, cls: "ico-gold" },
  decision: { label: "Decision", icon: Scale, cls: "ico-teal" },
  handoff: { label: "Handoff", icon: Handshake, cls: "ico-red" },
};

export default function CommandPalette({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const open = useCallback((initial = "") => {
    setQuery(initial);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 20);
    else { setQuery(""); setHits(null); setSel(0); }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setHits(await res.json());
    }, 120);
    return () => clearTimeout(t);
  }, [query, isOpen]);

  const grouped = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const h of hits ?? []) {
      const arr = map.get(h.type) ?? [];
      arr.push(h);
      map.set(h.type, arr);
    }
    return Array.from(map.entries());
  }, [hits]);
  const flat = useMemo(() => grouped.flatMap(([, arr]) => arr), [grouped]);

  useEffect(() => { setSel(0); }, [query]);

  const go = useCallback((href: string) => {
    setIsOpen(false);
    router.push(href);
  }, [router]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, flat.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && flat[sel]) { e.preventDefault(); go(flat[sel].href); }
  };

  let idx = -1;

  return (
    <PaletteCtx.Provider value={{ open }}>
      {children}
      {isOpen && (
        <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="palette" role="dialog" aria-label="Global search">
            <input
              ref={inputRef}
              className="palette-input"
              placeholder="Search projects, tasks, documents, sessions, prompts, decisions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="palette-list">
              {flat.length === 0 && (
                <div className="palette-empty">
                  {hits === null ? "Searching…" : query.trim() ? (
                    <span className="row" style={{ justifyContent: "center", gap: 8 }}>
                      <Search size={15} /> No matches for “{query}”
                    </span>
                  ) : "Type to search across your workspace."}
                </div>
              )}
              {grouped.map(([type, arr]) => {
                const meta = TYPE_META[type] ?? TYPE_META.project;
                return (
                  <div key={type}>
                    <div className="palette-group">{meta.label}s</div>
                    {arr.map((h) => {
                      idx += 1;
                      const myIdx = idx;
                      const Icon = meta.icon;
                      return (
                        <div
                          key={h.id}
                          className={`palette-item ${myIdx === sel ? "sel" : ""}`}
                          onMouseEnter={() => setSel(myIdx)}
                          onClick={() => go(h.href)}
                        >
                          <span className={`palette-ico ${meta.cls}`}><Icon size={15} /></span>
                          <span className="row-grow">
                            <span className="row-title">{h.title}</span>
                            <span className="row-sub" style={{ display: "block" }}>{h.sub}</span>
                          </span>
                          {h.projectKey && <span className="chip tiny">{h.projectKey}</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PaletteCtx.Provider>
  );
}
