"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "./Modal";
import { createProject } from "@/lib/actions";
import { PROJECT_COLORS } from "@/lib/constants";

export default function NewProjectForm({ trigger = "New project" }: { trigger?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button className="btn btn-gold" onClick={() => setOpen(true)}>
        <Plus size={15} />
        {trigger}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Create project">
        <form
          action={async (fd) => {
            await createProject(fd);
            setOpen(false);
            router.refresh();
          }}
          className="stack-sm"
        >
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="np-name">Project name</label>
              <input id="np-name" name="name" className="input" placeholder="e.g. Acme" required />
            </div>
            <div className="field">
              <label htmlFor="np-key">Short key</label>
              <input id="np-key" name="key" className="input" placeholder="ACME" maxLength={10} />
            </div>
            <div className="field">
              <label htmlFor="np-role">Your role</label>
              <input id="np-role" name="role" className="input" placeholder="Founding Engineer" />
            </div>
            <div className="field span-2">
              <label htmlFor="np-desc">Description</label>
              <input id="np-desc" name="description" className="input" placeholder="What is this project?" />
            </div>
            <div className="field span-2">
              <label htmlFor="np-mission">Mission</label>
              <textarea id="np-mission" name="mission" className="textarea" style={{ minHeight: 64 }} placeholder="Why does it exist?" />
            </div>
            <div className="field">
              <label htmlFor="np-objective">Current objective</label>
              <input id="np-objective" name="objective" className="input" placeholder="v0.1 release" />
            </div>
            <div className="field">
              <label htmlFor="np-milestone">Next milestone</label>
              <input id="np-milestone" name="milestone" className="input" placeholder="Friday Demo" />
            </div>
            <div className="field span-2">
              <label>Accent color</label>
              <div className="row wrap">
                {PROJECT_COLORS.map((c) => (
                  <label key={c} className="row" style={{ gap: 6, cursor: "pointer", textTransform: "capitalize" }}>
                    <input type="radio" name="color" value={c} defaultChecked={c === "blue"} />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="row right mt-2">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create project</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
