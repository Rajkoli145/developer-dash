import { db } from "@/lib/db";
import { Empty } from "@/components/ui";
import { ACTIVITY_ICON } from "@/lib/icons";
import { formatDateTime, timeAgoGroup } from "@/utils";

export default async function ActivityTab({ project }: { project: { id: string } }) {
  const activities = await db.activity.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  const groups: Record<string, typeof activities> = {};
  for (const a of activities) {
    const g = timeAgoGroup(a.createdAt);
    (groups[g] ??= []).push(a);
  }

  return (
    <section className="card card-pad">
      <div className="card-head">
        <h3 className="card-title">Project activity</h3>
        <span className="chip tiny">{activities.length} events</span>
      </div>
      {activities.length === 0 && <Empty title="No activity yet" sub="Actions across this project will show up here." />}
      {(["today", "yesterday", "older"] as const).map((g) =>
        groups[g]?.length ? (
          <div key={g} className="mt-2">
            <div className="tiny strong muted mb-2" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {g === "today" ? "Today" : g === "yesterday" ? "Yesterday" : "Earlier"}
            </div>
            <div className="timeline">
              {groups[g].map((a) => (
                <div key={a.id} className="tl-item">
                  <span className="tl-dot" style={{ fontSize: 9 }}>{ACTIVITY_ICON[a.kind] ?? "•"}</span>
                  <div className="tl-time">{formatDateTime(a.createdAt)}</div>
                  <div className="tl-text">{a.message}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </section>
  );
}
