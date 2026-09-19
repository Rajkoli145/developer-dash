"use client";

import { Search, Menu, Plus, Command } from "lucide-react";
import { usePalette } from "./CommandPalette";

export default function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { open } = usePalette();
  return (
    <header className="topbar">
      <button className="btn btn-outline btn-icon mobile-only" aria-label="Open menu" onClick={onMenu}>
        <Menu size={18} />
      </button>
      <button className="search-btn" onClick={() => open("")}>
        <Search size={16} />
        <span className="search-hint">Search projects, tasks, docs, sessions…</span>
        <span className="kbd right">⌘K</span>
      </button>
      <div className="topbar-right">
        <a className="btn btn-ghost btn-sm" href="/prompts">
          <Command size={15} />
          Prompt library
        </a>
        <a className="btn btn-gold btn-sm" href="/projects/new">
          <Plus size={15} />
          New project
        </a>
      </div>
    </header>
  );
}
