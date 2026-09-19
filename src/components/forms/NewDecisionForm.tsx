"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "../Modal";
import { createDecision } from "@/lib/actions";

type ProjectOpt = { id: string; name: string; key: string };

export default function NewDecisionForm({
  projectId, projects, trigger = "New decision", triggerClass = "btn btn-gold btn-sm",
}: {
  projectId?: string;
  projects?: ProjectOpt[];
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
      <Modal open={open} onClose={() => setOpen(false)} title="Record decision" wide>
        <form action={async (fd) => { await createDecision(fd); setOpen(false); router.refresh(); }} className="stack-sm">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="ndc-title">Title</label>
              <input id="ndc-title" name="title" className="input" placeholder="Pick the database" required />
            </div>
            <div className="field span-2">
              <label htmlFor="ndc-decision">Decision</label>
              <textarea id="ndc-decision" name="decision" className="textarea" style={{ minHeight: 60 }} required placeholder="State the decision in one sentence." />
            </div>
            <div className="field span-2">
              <label htmlFor="ndc-context">Context</label>
              <textarea id="ndc-context" name="context" className="textarea" style={{ minHeight: 60 }} placeholder="Why was this decision needed?" />
            </div>
            <div className="field span-2">
              <label htmlFor="ndc-reason">Reason</label>
              <textarea id="ndc-reason" name="reason" className="textarea" style={{ minHeight: 54 }} placeholder="Prevents duplicate authorization." />
            </div>
            <div className="field">
              <label htmlFor="ndc-alt">Alternatives considered</label>
              <textarea id="ndc-alt" name="alternatives" className="textarea" style={{ minHeight: 54 }} />
            </div>
            <div className="field">
              <label htmlFor="ndc-cons">Consequences</label>
              <textarea id="ndc-cons" name="consequences" className="textarea" style={{ minHeight: 54 }} />
            </div>
            <div className="field">
              <label htmlFor="ndc-status">Status</label>
              <select id="ndc-status" name="status" className="select" defaultValue="ACCEPTED">
                <option value="PROPOSED">Proposed</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="SUPERSEDED">Superseded</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            {projectId ? (
              <div className="field">
                <label>Project</label>
                <input className="input" value="This project" disabled />
                <input type="hidden" name="projectId" value={projectId} />
              </div>
            ) : (
              <div className="field">
                <label htmlFor="ndc-project">Project</label>
                <select id="ndc-project" name="projectId" className="select" required>
                  <option value="">Select project…</option>
                  {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="row right mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save decision</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
