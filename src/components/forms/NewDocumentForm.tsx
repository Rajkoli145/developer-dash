"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "../Modal";
import { createDocument } from "@/lib/actions";
import { DOC_KINDS, DOC_KIND_LABEL } from "@/lib/constants";

type ProjectOpt = { id: string; name: string; key: string };

export default function NewDocumentForm({
  projectId, projects, trigger = "Add document", triggerClass = "btn btn-gold btn-sm",
}: {
  projectId?: string;
  projects?: ProjectOpt[];
  trigger?: string;
  triggerClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "link" | "text">("file");
  const router = useRouter();

  return (
    <>
      <button className={triggerClass} onClick={() => setOpen(true)}>
        <Plus size={14} />
        {trigger}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add document" wide>
        <form action={async (fd) => {
          const f = fd.get("file");
          if (f instanceof File && f.size > 8 * 1024 * 1024) {
            alert("File is larger than 8 MB. Please choose a smaller file.");
            return;
          }
          await createDocument(fd);
          setOpen(false);
          router.refresh();
        }} className="stack-sm">
          <div className="form-grid">
            {projectId ? (
              <input type="hidden" name="projectId" value={projectId} />
            ) : (
              <div className="field">
                <label htmlFor="nd-project">Project</label>
                <select id="nd-project" name="projectId" className="select" required>
                  <option value="">Select project…</option>
                  {(projects ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="nd-title">Title</label>
              <input id="nd-title" name="title" className="input" placeholder="Project specification" required />
            </div>
          </div>

          <div className="row" style={{ gap: 6 }}>
            {(["file", "link", "text"] as const).map((m) => (
              <button key={m} type="button" className={`chip chip-btn ${mode === m ? "on" : ""}`} onClick={() => setMode(m)}>
                {m === "file" ? "Upload file" : m === "link" ? "External link" : "Write markdown"}
              </button>
            ))}
          </div>

          {mode === "file" && (
            <div className="field">
              <label htmlFor="nd-file">File <span className="muted">(max 8 MB)</span></label>
              <input id="nd-file" name="file" type="file" className="input" accept=".pdf,.md,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg" />
            </div>
          )}
          {mode === "link" && (
            <div className="field">
              <label htmlFor="nd-url">URL</label>
              <input id="nd-url" name="externalUrl" type="url" className="input" placeholder="https://…" />
            </div>
          )}
          {mode === "text" && (
            <div className="field">
              <label htmlFor="nd-content">Content</label>
              <textarea id="nd-content" name="content" className="textarea" placeholder="# Notes…" style={{ minHeight: 140 }} />
            </div>
          )}

          <input type="hidden" name="kind" value={mode === "link" ? "LINK" : mode === "text" ? "MARKDOWN" : "OTHER"} />
          {mode === "text" && <input type="hidden" name="kind" value="MARKDOWN" />}

          <div className="form-grid">
            <div className="field">
              <label htmlFor="nd-kind">Kind (for uploads)</label>
              <select id="nd-kind" name="kindSelect" className="select" defaultValue="">
                <option value="">Auto-detect from file</option>
                {DOC_KINDS.map((k) => <option key={k} value={k}>{DOC_KIND_LABEL[k]}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nd-cat">Category</label>
              <input id="nd-cat" name="category" className="input" placeholder="Spec / Contract / Notes…" />
            </div>
            <div className="field span-2">
              <label htmlFor="nd-desc">Description</label>
              <input id="nd-desc" name="description" className="input" placeholder="What is this document for?" />
            </div>
          </div>

          <div className="row right mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save document</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
