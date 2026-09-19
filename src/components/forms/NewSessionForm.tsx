"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "../Modal";
import { createSession } from "@/lib/actions";
import { AGENTS, AGENT_LABEL, SESSION_RESULTS } from "@/lib/constants";

type ProjectOpt = { id: string; name: string; key: string };
type TaskOpt = { id: string; title: string; projectId: string };
type DocOpt = { id: string; title: string };

export default function NewSessionForm({
  projectId, projects, tasks, documents, trigger = "Log session", triggerClass = "btn btn-gold btn-sm",
}: {
  projectId?: string;
  projects?: ProjectOpt[];
  tasks?: TaskOpt[];
  documents?: DocOpt[];
  trigger?: string;
  triggerClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button className={triggerClass} onClick={() => setOpen(true)}>
        <Plus size={14} />
        {trigger}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Log AI session" wide>
        <form action={async (fd) => { await createSession(fd); setOpen(false); router.refresh(); }} className="stack-sm">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="ns-agent">Agent</label>
              <select id="ns-agent" name="agent" className="select" defaultValue="CLAUDE">
                {AGENTS.map((a) => <option key={a} value={a}>{AGENT_LABEL[a]}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ns-title">Session title</label>
              <input id="ns-title" name="title" className="input" placeholder="Architecture walkthrough" required />
            </div>
            {projectId ? (
              <input type="hidden" name="projectId" value={projectId} />
            ) : (
              <div className="field">
                <label htmlFor="ns-project">Project</label>
                <select id="ns-project" name="projectId" className="select">
                  <option value="">Unlinked</option>
                  {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="ns-task">Related task</label>
              <select id="ns-task" name="taskId" className="select">
                <option value="">None</option>
                {(tasks ?? []).filter((t) => !projectId || true).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ns-goal">Goal</label>
              <input id="ns-goal" name="goal" className="input" placeholder="What did you set out to do?" />
            </div>
            <div className="field">
              <label htmlFor="ns-result">Result</label>
              <select id="ns-result" name="result" className="select" defaultValue="SUCCESS">
                {SESSION_RESULTS.map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="ns-prompt">Prompt used</label>
              <textarea id="ns-prompt" name="prompt" className="textarea" style={{ minHeight: 60 }} placeholder="The main prompt you sent…" />
            </div>
            <div className="field span-2">
              <label htmlFor="ns-summary">Summary</label>
              <textarea id="ns-summary" name="summary" className="textarea" style={{ minHeight: 60 }} placeholder="What happened in this session?" />
            </div>
            <div className="field">
              <label htmlFor="ns-actions">Actions taken (one per line)</label>
              <textarea id="ns-actions" name="actions" className="textarea" style={{ minHeight: 60 }} />
            </div>
            <div className="field">
              <label htmlFor="ns-files">Files changed (one per line)</label>
              <textarea id="ns-files" name="filesChanged" className="textarea mono" style={{ minHeight: 60 }} placeholder="src/index.ts" />
            </div>
            <div className="field">
              <label htmlFor="ns-decisions">Decisions made</label>
              <textarea id="ns-decisions" name="decisions" className="textarea" style={{ minHeight: 54 }} />
            </div>
            <div className="field">
              <label htmlFor="ns-problems">Problems hit</label>
              <textarea id="ns-problems" name="problems" className="textarea" style={{ minHeight: 54 }} />
            </div>
            <div className="field span-2">
              <label htmlFor="ns-next">Next step</label>
              <input id="ns-next" name="nextStep" className="input" placeholder="Test the timeout scenario" />
            </div>
            {documents && documents.length > 0 && (
              <div className="field span-2">
                <label>Attach documents</label>
                <div className="row wrap">
                  {documents.map((d) => (
                    <label key={d.id} className="chip chip-btn" style={{ textTransform: "none" }}>
                      <input type="checkbox" name="documentIds" value={d.id} style={{ display: "none" }} />
                      {d.title}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="row right mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save session</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
