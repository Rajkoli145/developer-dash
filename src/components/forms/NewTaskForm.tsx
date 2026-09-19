"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "../Modal";
import { createTask } from "@/lib/actions";
import { TASK_STATUSES, TASK_STATUS_LABEL, PRIORITIES } from "@/lib/constants";

type ProjectOpt = { id: string; name: string; key: string };

export default function NewTaskForm({
  projectId, projects, trigger = "New task", triggerClass = "btn btn-gold btn-sm",
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
      <Modal open={open} onClose={() => setOpen(false)} title="Create task">
        <form
          action={async (fd) => {
            await createTask(fd);
            setOpen(false);
            router.refresh();
          }}
          className="stack-sm"
        >
          <div className="field">
            <label htmlFor="nt-title">Title</label>
            <input id="nt-title" name="title" className="input" placeholder="Scaffold the client" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="nt-desc">Description</label>
            <textarea id="nt-desc" name="description" className="textarea" style={{ minHeight: 70 }} placeholder="What needs to happen?" />
          </div>
          <div className="form-grid">
            {projectId ? (
              <input type="hidden" name="projectId" value={projectId} />
            ) : (
              <div className="field">
                <label htmlFor="nt-project">Project</label>
                <select id="nt-project" name="projectId" className="select" required>
                  <option value="">Select project…</option>
                  {(projects ?? []).map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="nt-status">Status</label>
              <select id="nt-status" name="status" className="select" defaultValue="TODO">
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{TASK_STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nt-priority">Priority</label>
              <select id="nt-priority" name="priority" className="select" defaultValue="MEDIUM">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nt-due">Due date</label>
              <input id="nt-due" name="dueDate" type="date" className="input" />
            </div>
          </div>
          <div className="row right mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create task</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
