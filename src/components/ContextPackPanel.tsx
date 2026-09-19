"use client";

import { useState } from "react";
import { Sparkles, ClipboardCopy, Check } from "lucide-react";
import { DEFAULT_CONTEXT_OPTIONS, type ContextOptions } from "@/lib/handoff";

const OPTION_LABELS: { key: keyof ContextOptions; label: string }[] = [
  { key: "projectContext", label: "Project context" },
  { key: "currentTask", label: "Current task" },
  { key: "documents", label: "Relevant documents" },
  { key: "sessions", label: "Recent sessions" },
  { key: "decisions", label: "Decisions" },
  { key: "prompts", label: "Important prompts" },
  { key: "completed", label: "Completed work" },
  { key: "handoff", label: "Handoff" },
];

export default function ContextPackPanel({ projectId, compact = false }: { projectId: string; compact?: boolean }) {
  const [opts, setOpts] = useState<ContextOptions>(DEFAULT_CONTEXT_OPTIONS);
  const [pack, setPack] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [taskId, setTaskId] = useState<string>("");

  const generate = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/context/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...opts, taskId: taskId || null }),
      });
      setPack(await res.text());
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!pack) return;
    try { await navigator.clipboard.writeText(pack); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="card card-pad">
      <div className="card-head">
        <h3 className="card-title" style={{ fontSize: 15.5 }}>Context pack</h3>
        <span className="chip tiny"><Sparkles size={11} /> AI-ready</span>
      </div>
      <div className="stack-sm">
        {(compact ? OPTION_LABELS.filter((o) => compactOpts.has(o.key)) : OPTION_LABELS).map(({ key, label }) => (
          <label
            key={key}
            className={`check-row ${opts[key] ? "on" : ""}`}
          >
            <input
              type="checkbox"
              checked={opts[key]}
              onChange={(e) => setOpts((o) => ({ ...o, [key]: e.target.checked }))}
              style={{ display: "none" }}
            />
            <span className="check-box">{opts[key] ? <Check size={12} /> : null}</span>
            <span className="small strong">{label}</span>
          </label>
        ))}
        <TaskPicker projectId={projectId} value={taskId} onChange={setTaskId} />
        <div className="row mt-1">
          <button className="btn btn-primary btn-sm" onClick={generate} disabled={busy}>
            <Sparkles size={14} />
            {busy ? "Generating…" : "Generate context"}
          </button>
          {pack && (
            <button className="btn btn-gold btn-sm" onClick={copy}>
              {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
              {copied ? "Copied — paste into your agent" : "Copy context"}
            </button>
          )}
        </div>
        {pack && <pre className="preblock mt-2">{pack}</pre>}
      </div>
    </section>
  );
}

const compactOpts = new Set<keyof ContextOptions>(["projectContext", "currentTask", "documents", "sessions", "decisions", "handoff"]);

function TaskPicker({ projectId, value, onChange }: { projectId: string; value: string; onChange: (v: string) => void }) {
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  if (!loaded) {
    setLoaded(true);
    fetch(`/api/projects/${projectId}/tasks`)
      .then((r) => r.json())
      .then(setTasks)
      .catch(() => setTasks([]));
  }
  return (
    <div className="field">
      <label style={{ fontSize: 11 }}>Anchor task (optional)</label>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Auto — current task</option>
        {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>
    </div>
  );
}
