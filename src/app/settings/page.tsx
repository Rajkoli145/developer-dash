import { db } from "@/lib/db";
import { currentUser } from "@/lib/actions";
import { initials } from "@/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  const [projectCount, taskCount, docCount, sessionCount] = await Promise.all([
    db.project.count(), db.task.count(), db.document.count(), db.aiSession.count(),
  ]);

  return (
    <div className="stack" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Your workspace at a glance.</p>
        </div>
      </div>

      <section className="card card-pad">
        <div className="row" style={{ gap: 14 }}>
          <div className="avatar" style={{ width: 52, height: 52, fontSize: 16 }}>{initials(user.name)}</div>
          <div>
            <div className="strong" style={{ fontSize: 17 }}>{user.name}</div>
            <div className="small muted">{user.email} · {user.role.toLowerCase()}</div>
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Workspace</h3></div>
        <div className="stat-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          <MiniStat label="Projects" value={projectCount} />
          <MiniStat label="Tasks" value={taskCount} />
          <MiniStat label="Documents" value={docCount} />
          <MiniStat label="AI Sessions" value={sessionCount} />
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Shortcuts</h3></div>
        <div className="stack-sm small">
          <div className="row spread"><span>Global search / command palette</span><span className="kbd">⌘K</span></div>
          <div className="row spread"><span>Close dialogs</span><span className="kbd">Esc</span></div>
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-head"><h3 className="card-title" style={{ fontSize: 15.5 }}>Data</h3></div>
        <div className="small muted">
          Data lives in your <span className="filepath">DATABASE_URL</span> (PostgreSQL — Neon, Supabase, or Vercel Postgres). Uploads go to
          the <span className="filepath">UPLOAD_DIR</span> directory (or <span className="filepath">/tmp</span> on serverless). Owner identity comes from
          <span className="filepath"> OWNER_EMAIL</span> / <span className="filepath">OWNER_NAME</span>.
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>{value}</div>
      <div className="tiny muted strong" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  );
}
