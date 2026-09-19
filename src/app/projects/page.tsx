import Link from "next/link";
import { ArrowUpRight, Bot, FileText, FolderKanban } from "lucide-react";
import { allProjects } from "@/lib/data";
import { Ring, ProgressBar, StatusBadge, Empty } from "@/components/ui";
import { relTime } from "@/utils";
import NewProjectForm from "@/components/NewProjectForm";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await allProjects();
  const active = projects.filter((p) => p.status === "ACTIVE");
  const others = projects.filter((p) => p.status !== "ACTIVE");

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">{projects.length} projects · {active.length} active</p>
        </div>
        <NewProjectForm />
      </div>

      {active.length === 0 && others.length === 0 && (
        <Empty icon={<FolderKanban size={20} />} title="No projects yet" sub="Create your first project to start building context." />
      )}

      {active.length > 0 && (
        <section>
          <SectionHead2 title="Active" />
          <div className="grid-3">
            {active.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-2">
          <SectionHead2 title="Paused & completed" />
          <div className="grid-3">
            {others.map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHead2({ title }: { title: string }) {
  return <h2 className="section-title mb-2">{title}</h2>;
}

function ProjectCard({ p }: { p: Awaited<ReturnType<typeof allProjects>>[number] }) {
  return (
    <Link href={`/projects/${p.id}`} className="card card-hover card-pad" style={{ display: "flex", gap: 18, alignItems: "center" }}>
      <Ring value={p.progress} size={104} stroke={10} color={p.color}>
        <div className="center">
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em" }}>{p.progress}%</div>
        </div>
      </Ring>
      <div className="row-grow" style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
        <div className="row spread">
          <span className="chip tiny">{p.key}</span>
          <StatusBadge status={p.status} />
        </div>
        <div className="strong" style={{ fontSize: 17, letterSpacing: "-0.02em" }}>{p.name}</div>
        <div className="small muted clamp-2">{p.role ?? p.description ?? "No description"}</div>
        <div className="row wrap" style={{ gap: 10 }}>
          <span className="chip tiny"><FileText size={11} /> {p.docCount}</span>
          <span className="chip tiny"><Bot size={11} /> {p.sessionCount}</span>
          <span className="chip tiny">{p.taskDone}/{p.taskTotal} tasks</span>
          <span className="tiny muted row" style={{ gap: 3, marginLeft: "auto" }}>
            {relTime(p.updatedAt)} <ArrowUpRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
