"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open, onClose, title, children, wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-label={title} style={{ width: wide ? "min(760px, 100%)" : "min(560px, 100%)" }}>
        <div className="row spread" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
          <h3 className="card-title" style={{ fontSize: 16 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div style={{ padding: 20, maxHeight: "70vh", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
