import { db } from "@/lib/db";
import { relTime, truncate } from "@/utils";
import CopyButton from "./CopyButton";
import UsePromptButton from "./UsePromptButton";

export default async function PromptCard({ prompt }: { prompt: { id: string } }) {
  const p = await db.prompt.findUniqueOrThrow({ where: { id: prompt.id } });

  return (
    <div className="card card-pad card-hover" style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
      <div className="row spread wrap" style={{ gap: 8 }}>
        <span className="chip tiny">{p.category}</span>
        <span className="tiny muted">used {p.usageCount}× · {relTime(p.updatedAt)}</span>
      </div>
      <div>
        <div className="strong" style={{ fontSize: 15 }}>{p.name}</div>
        {p.description && <div className="small muted mt-1">{p.description}</div>}
      </div>
      <pre className="preblock" style={{ flex: 1, maxHeight: 170 }}>{truncate(p.body, 420)}</pre>
      {p.tags && (
        <div className="row wrap" style={{ gap: 5 }}>
          {p.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => <span key={t} className="chip tiny">#{t}</span>)}
        </div>
      )}
      <div className="row" style={{ gap: 8 }}>
        <CopyButton text={p.body} label="Copy" />
        <UsePromptButton promptId={p.id} />
      </div>
    </div>
  );
}
