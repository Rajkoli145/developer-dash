import { updateProject } from "@/lib/actions";
import { PROJECT_COLORS, PROJECT_STATUSES } from "@/lib/constants";
import { COLOR_HEX } from "@/lib/constants";

export default function SettingsTab({ project }: { project: Record<string, unknown> & { id: string } }) {
  const p = project as {
    id: string; name: string; key: string; description: string | null; role: string | null;
    mission: string | null; architecture: string | null; techStack: string | null; constraints: string | null;
    devRules: string | null; objective: string | null; objectiveLabel: string | null; milestone: string | null;
    milestoneDate: Date | null; status: string; color: string; githubUrl: string | null; progressOverride: number | null;
  };
  const dateVal = p.milestoneDate ? new Date(p.milestoneDate).toISOString().slice(0, 10) : "";

  return (
    <form action={updateProject} className="stack">
      <input type="hidden" name="id" value={p.id} />
      <section className="card card-pad">
        <div className="card-head"><h3 className="card-title">Identity</h3></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="ps-name">Name</label><input id="ps-name" name="name" className="input" defaultValue={p.name} /></div>
          <div className="field"><label htmlFor="ps-key">Short key</label><input id="ps-key" name="key" className="input" defaultValue={p.key} maxLength={10} /></div>
          <div className="field"><label htmlFor="ps-role">Your role</label><input id="ps-role" name="role" className="input" defaultValue={p.role ?? ""} /></div>
          <div className="field"><label htmlFor="ps-status">Status</label>
            <select id="ps-status" name="status" className="select" defaultValue={p.status}>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div className="field span-2"><label htmlFor="ps-desc">Description</label><input id="ps-desc" name="description" className="input" defaultValue={p.description ?? ""} /></div>
          <div className="field span-2"><label htmlFor="ps-mission">Mission — why does this exist?</label><textarea id="ps-mission" name="mission" className="textarea" defaultValue={p.mission ?? ""} /></div>
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-head"><h3 className="card-title">Context</h3></div>
        <div className="form-grid">
          <div className="field span-2"><label htmlFor="ps-arch">Architecture</label><textarea id="ps-arch" name="architecture" className="textarea" defaultValue={p.architecture ?? ""} /></div>
          <div className="field span-2"><label htmlFor="ps-stack">Tech stack (one per line)</label><textarea id="ps-stack" name="techStack" className="textarea mono" defaultValue={p.techStack ?? ""} /></div>
          <div className="field span-2"><label htmlFor="ps-cons">Constraints</label><textarea id="ps-cons" name="constraints" className="textarea" defaultValue={p.constraints ?? ""} /></div>
          <div className="field span-2"><label htmlFor="ps-rules">Development rules</label><textarea id="ps-rules" name="devRules" className="textarea" defaultValue={p.devRules ?? ""} /></div>
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-head"><h3 className="card-title">Current focus</h3></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="ps-objl">Objective label</label><input id="ps-objl" name="objectiveLabel" className="input" defaultValue={p.objectiveLabel ?? "Current objective"} /></div>
          <div className="field"><label htmlFor="ps-obj">Objective</label><input id="ps-obj" name="objective" className="input" defaultValue={p.objective ?? ""} /></div>
          <div className="field"><label htmlFor="ps-mile">Next milestone</label><input id="ps-mile" name="milestone" className="input" defaultValue={p.milestone ?? ""} /></div>
          <div className="field"><label htmlFor="ps-miled">Milestone date</label><input id="ps-miled" name="milestoneDate" type="date" className="input" defaultValue={dateVal} /></div>
          <div className="field"><label htmlFor="ps-prog">Progress override % (blank = auto)</label>
            <input id="ps-prog" name="progressOverride" type="number" min={0} max={100} className="input" defaultValue={p.progressOverride ?? ""} />
          </div>
          <div className="field"><label htmlFor="ps-gh">GitHub URL</label><input id="ps-gh" name="githubUrl" type="url" className="input" defaultValue={p.githubUrl ?? ""} /></div>
          <div className="field span-2"><label>Accent color</label>
            <div className="row wrap" style={{ gap: 10 }}>
              {PROJECT_COLORS.map((c) => (
                <label key={c} className="row" style={{ gap: 5, cursor: "pointer", textTransform: "capitalize" }}>
                  <input type="radio" name="color" value={c} defaultChecked={p.color === c} />
                  <span className="dot" style={{ background: COLOR_HEX[c] }} />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="row right">
        <button type="submit" className="btn btn-primary">Save settings</button>
      </div>
    </form>
  );
}
