import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { projectStats } from "@/lib/data";
import { Ring, StatusBadge } from "@/components/ui";
import { relTime } from "@/utils";
import OverviewTab from "./tabs/OverviewTab";
import TasksTab from "./tabs/TasksTab";
import DocumentsTab from "./tabs/DocumentsTab";
import SessionsTab from "./tabs/SessionsTab";
import PromptsTab from "./tabs/PromptsTab";
import DecisionsTab from "./tabs/DecisionsTab";
import HandoffsTab from "./tabs/HandoffsTab";
import ActivityTab from "./tabs/ActivityTab";
import SettingsTab from "./tabs/SettingsTab";
import { COLOR_HEX } from "@/lib/constants";
import { Github, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

const TABS = [
  ["overview", "Overview"],
  ["tasks", "Tasks"],
  ["documents", "Documents"],
  ["sessions", "AI Sessions"],
  ["prompts", "Prompts"],
  ["decisions", "Decisions"],
  ["handoffs", "Handoffs"],
  ["activity", "Activity"],
  ["settings", "Settings"],
] as const;

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const project = await db.project.findUnique({
    where: { id },
    include: { members: { include: { user: true } } },
  });
  if (!project) notFound();
  const stats = await projectStats(id);

  const activeTab = TABS.find(([t]) => t === tab)?.[0] ?? "overview";

  return (
    <div className="stack">
      <nav className="row small muted" style={{ gap: 6 }}>
        <Link href="/projects" className="card-link">Projects</Link>
        <span>/</span>
        <span className="strong" style={{ color: "var(--ink)" }}>{project.name}</span>
      </nav>

      <header className="proj-banner">
        <div className="proj-banner-top">
          <span className="proj-key" style={{ background: `linear-gradient(135deg, ${COLOR_HEX[project.color] ?? COLOR_HEX.blue}, ${COLOR_HEX[project.color] ?? COLOR_HEX.blue}cc)` }}>
            {project.key}
          </span>
          <div className="row-grow" style={{ minWidth: 0 }}>
            <div className="row wrap" style={{ gap: 10 }}>
              <h1 className="page-title">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="small muted mt-1">{project.role ?? "Personal project"}</div>
          </div>
          <div className="row" style={{ gap: 16 }}>
            <Ring value={stats.progress} size={84} stroke={9} color={project.color}>
              <div className="center">
                <div style={{ fontSize: 17, fontWeight: 800 }}>{stats.progress}%</div>
              </div>
            </Ring>
            <div className="stack-sm" style={{ gap: 6 }}>
              <div className="small strong">{stats.progress}% complete</div>
              <div className="tiny muted">{stats.done} / {stats.total} tasks</div>
              {project.githubUrl && (
                <a className="chip tiny" href={project.githubUrl} target="_blank" rel="noreferrer">
                  <Github size={11} /> GitHub
                </a>
              )}
              <div className="tiny muted row" style={{ gap: 4 }}>
                <CalendarDays size={11} /> Updated {relTime(project.updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="tabs no-scrollbar">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/projects/${project.id}?tab=${key}`}
            className={`tab ${activeTab === key ? "active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {activeTab === "overview" && <OverviewTab project={project} stats={stats} />}
      {activeTab === "tasks" && <TasksTab project={project} />}
      {activeTab === "documents" && <DocumentsTab project={project} />}
      {activeTab === "sessions" && <SessionsTab project={project} />}
      {activeTab === "prompts" && <PromptsTab project={project} />}
      {activeTab === "decisions" && <DecisionsTab project={project} />}
      {activeTab === "handoffs" && <HandoffsTab project={project} />}
      {activeTab === "activity" && <ActivityTab project={project} />}
      {activeTab === "settings" && <SettingsTab project={project} />}
    </div>
  );
}
