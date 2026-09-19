import { createProject } from "@/lib/actions";
import { PROJECT_COLORS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">New project</h1>
          <p className="page-sub">Set up a home for everything a project needs.</p>
        </div>
      </div>
      <form action={createProject} className="stack">
        <section className="card card-pad stack-sm">
          <div className="form-grid">
            <div className="field span-2">
              <label htmlFor="npp-name">Project name</label>
              <input id="npp-name" name="name" className="input" placeholder="Acme" required />
            </div>
            <div className="field">
              <label htmlFor="npp-key">Short key</label>
              <input id="npp-key" name="key" className="input" placeholder="ACME" maxLength={10} />
            </div>
            <div className="field">
              <label htmlFor="npp-role">Your role</label>
              <input id="npp-role" name="role" className="input" placeholder="Founding Engineer — Agent Experience" />
            </div>
            <div className="field span-2">
              <label htmlFor="npp-desc">Description</label>
              <input id="npp-desc" name="description" className="input" placeholder="Financial infrastructure for AI agents." />
            </div>
            <div className="field span-2">
              <label htmlFor="npp-mission">Mission — why does this exist?</label>
              <textarea id="npp-mission" name="mission" className="textarea" style={{ minHeight: 70 }} />
            </div>
            <div className="field">
              <label htmlFor="npp-objective">Current objective</label>
              <input id="npp-objective" name="objective" className="input" placeholder="v0.1 release" />
            </div>
            <div className="field">
              <label htmlFor="npp-milestone">Next milestone</label>
              <input id="npp-milestone" name="milestone" className="input" placeholder="Friday Demo" />
            </div>
            <div className="field span-2">
              <label>Accent color</label>
              <div className="row wrap" style={{ gap: 10 }}>
                {PROJECT_COLORS.map((c) => (
                  <label key={c} className="row" style={{ gap: 5, cursor: "pointer", textTransform: "capitalize" }}>
                    <input type="radio" name="color" value={c} defaultChecked={c === "blue"} />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>
        <div className="row right">
          <button type="submit" className="btn btn-primary">Create project</button>
        </div>
      </form>
    </div>
  );
}
