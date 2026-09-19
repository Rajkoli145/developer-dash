import {
  LayoutDashboard, FolderKanban, CircleDot, FileText, Bot, MessageSquareCode, Scale, Handshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: CircleDot },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/sessions", label: "AI Sessions", icon: Bot },
  { href: "/prompts", label: "Prompts", icon: MessageSquareCode },
  { href: "/decisions", label: "Decisions", icon: Scale },
  { href: "/handoffs", label: "Handoffs", icon: Handshake },
];

export const ACTIVITY_ICON: Record<string, string> = {
  project_created: "📁",
  project_updated: "⚙️",
  task_created: "➕",
  task_completed: "✅",
  task_status: "↔️",
  document_uploaded: "📄",
  session_logged: "🤖",
  prompt_saved: "⭐",
  decision_created: "⚖️",
  handoff_generated: "🤝",
  progress_updated: "📈",
};

export function fileIconMeta(kind: string): { label: string; cls: string } {
  switch (kind) {
    case "PDF": return { label: "PDF", cls: "ico-red" };
    case "MARKDOWN": return { label: "MD", cls: "ico-blue" };
    case "TEXT": return { label: "TXT", cls: "ico-teal" };
    case "LINK": return { label: "URL", cls: "ico-gold" };
    case "IMAGE": return { label: "IMG", cls: "ico-purple" };
    default: return { label: "FILE", cls: "ico-orange" };
  }
}
