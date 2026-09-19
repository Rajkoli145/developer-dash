import Link from "next/link";
import { RING_COLORS, STATUS_CLASS, TASK_STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/utils";

export function Ring({
  value, size = 148, stroke = 13, color = "blue", trackClass, children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackClass?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  const strokeColor = RING_COLORS[color] ?? RING_COLORS.blue;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className={cn("ring-track", trackClass)} cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-val"
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={strokeColor} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-dot ${STATUS_CLASS[status] ?? "b-todo"}`}>
      {TASK_STATUS_LABEL[status] ?? status.replace("_", " ")}
    </span>
  );
}

export function GenericBadge({ value, map }: { value: string; map?: Record<string, string> }) {
  return (
    <span className={`badge badge-dot ${(map ?? STATUS_CLASS)[value] ?? "b-todo"}`}>
      {value.charAt(0) + value.slice(1).toLowerCase()}
    </span>
  );
}

export function StatCard({
  label, value, hint, icon, cls,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  cls: string;
}) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-ico ${cls}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, cls = "p-blue" }: { value: number; cls?: string }) {
  return (
    <div className={`progress ${cls}`}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function SectionHead({ title, href, linkLabel = "View all" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="row spread mb-2">
      <h2 className="section-title">{title}</h2>
      {href && <Link className="card-link" href={href}>{linkLabel} →</Link>}
    </div>
  );
}

export function Empty({ icon, title, sub }: { icon?: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="empty">
      {icon && <div className="empty-ico">{icon}</div>}
      <div className="strong" style={{ color: "var(--ink-2)" }}>{title}</div>
      {sub && <div className="small mt-1">{sub}</div>}
    </div>
  );
}
