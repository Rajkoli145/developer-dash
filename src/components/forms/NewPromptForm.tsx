"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "../Modal";
import { createPrompt } from "@/lib/actions";
import { PROMPT_CATEGORIES } from "@/lib/constants";

type ProjectOpt = { id: string; name: string; key: string };

export default function NewPromptForm({
  projectId, projects, trigger = "New prompt", triggerClass = "btn btn-gold btn-sm",
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
      <Modal open={open} onClose={() => setOpen(false)} title="Save prompt" wide>
        <form action={async (fd) => { await createPrompt(fd); setOpen(false); router.refresh(); }} className="stack-sm">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="npr-name">Name</label>
              <input id="npr-name" name="name" className="input" placeholder="Implementation partner" required />
            </div>
            <div className="field">
              <label htmlFor="npr-cat">Category</label>
              <select id="npr-cat" name="category" className="select" defaultValue="Coding">
                {PROMPT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field span-2">
              <label htmlFor="npr-body">Prompt</label>
              <textarea id="npr-body" name="body" className="textarea mono" style={{ minHeight: 140 }} required placeholder="Write the full prompt here…" />
            </div>
            <div className="field span-2">
              <label htmlFor="npr-desc">Description</label>
              <input id="npr-desc" name="description" className="input" placeholder="What is this prompt for?" />
            </div>
            <div className="field">
              <label htmlFor="npr-tags">Tags (comma separated)</label>
              <input id="npr-tags" name="tags" className="input" placeholder="typescript, testing" />
            </div>
            {projectId ? (
              <input type="hidden" name="projectId" value={projectId} />
            ) : (
              <div className="field">
                <label htmlFor="npr-project">Project</label>
                <select id="npr-project" name="projectId" className="select">
                  <option value="">General</option>
                  {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="row right mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save prompt</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
