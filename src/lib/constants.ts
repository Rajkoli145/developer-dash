export const AGENTS = ["CLAUDE", "CHATGPT", "CURSOR", "ANTIGRAVITY", "GEMINI", "OTHER"] as const;
export type Agent = (typeof AGENTS)[number];

export const AGENT_LABEL: Record<string, string> = {
  CLAUDE: "Claude",
  CHATGPT: "ChatGPT",
  CURSOR: "Cursor",
  ANTIGRAVITY: "Antigravity",
  GEMINI: "Gemini",
  OTHER: "Other",
};

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "DONE"] as const;
export const TASK_STATUS_LABEL: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  IN_REVIEW: "In Review",
  DONE: "Done",
};
export const STATUS_CLASS: Record<string, string> = {
  TODO: "b-todo",
  IN_PROGRESS: "b-inprogress",
  BLOCKED: "b-blocked",
  IN_REVIEW: "b-inreview",
  DONE: "b-done",
  ACTIVE: "b-active",
  PAUSED: "b-paused",
  COMPLETED: "b-completed",
  ARCHIVED: "b-archived",
  ACCEPTED: "b-accepted",
  PROPOSED: "b-proposed",
  SUPERSEDED: "b-superseded",
  REJECTED: "b-rejected",
};

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const PRIORITY_CLASS: Record<string, string> = {
  LOW: "b-todo",
  MEDIUM: "b-inprogress",
  HIGH: "b-inreview",
  URGENT: "b-blocked",
};

export const PROMPT_CATEGORIES = [
  "Coding", "Debugging", "Architecture", "Testing", "Code Review",
  "Research", "UI/UX", "Agent", "Documentation", "General",
] as const;

export const PROJECT_STATUSES = ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"] as const;

export const PROJECT_COLORS = ["blue", "green", "purple", "orange", "teal", "gold"] as const;

export const COLOR_HEX: Record<string, string> = {
  blue: "#4c7dd6",
  green: "#379a6c",
  purple: "#8265ce",
  orange: "#d9802f",
  teal: "#389e9e",
  gold: "#d9a82f",
  red: "#cd5757",
};

export const RING_COLORS: Record<string, string> = {
  blue: "#4c7dd6",
  green: "#379a6c",
  purple: "#8265ce",
  orange: "#d9802f",
  teal: "#389e9e",
  gold: "#e0b341",
};

export const PROGRESS_COLORS: Record<string, string> = {
  blue: "p-blue",
  green: "p-green",
  purple: "p-purple",
  orange: "p-orange",
  teal: "p-blue",
  gold: "p-orange",
  red: "p-orange",
};

export const DOC_KINDS = ["MARKDOWN", "PDF", "TEXT", "LINK", "IMAGE", "OTHER"] as const;
export const DOC_KIND_LABEL: Record<string, string> = {
  MARKDOWN: "Markdown",
  PDF: "PDF",
  TEXT: "Text",
  LINK: "Link",
  IMAGE: "Image",
  OTHER: "File",
};

export const SESSION_RESULTS = ["SUCCESS", "PARTIAL", "FAILED", "NEUTRAL"] as const;
export const RESULT_CLASS: Record<string, string> = {
  SUCCESS: "b-done",
  PARTIAL: "b-inreview",
  FAILED: "b-blocked",
  NEUTRAL: "b-todo",
};

export const LINK_KINDS = ["LINK", "REPO", "DESIGN", "SPEC"] as const;
export const LINK_KIND_LABEL: Record<string, string> = {
  LINK: "Link",
  REPO: "Repository",
  DESIGN: "Design",
  SPEC: "Specification",
};

export function agentClass(agent: string): string {
  switch (agent) {
    case "CLAUDE": return "agent-claude";
    case "CHATGPT": return "agent-chatgpt";
    case "CURSOR": return "agent-cursor";
    case "ANTIGRAVITY": return "agent-antigravity";
    case "GEMINI": return "agent-gemini";
    default: return "agent-other";
  }
}
