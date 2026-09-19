import Link from "next/link";
import { db } from "@/lib/db";
import { Empty } from "@/components/ui";
import { relTime, truncate } from "@/utils";
import NewPromptForm from "@/components/forms/NewPromptForm";
import PromptCard from "@/components/PromptCard";

export default async function PromptsTab({ project }: { project: { id: string } }) {
  const prompts = await db.prompt.findMany({
    where: { projectId: project.id },
    orderBy: { usageCount: "desc" },
  });

  return (
    <div className="stack">
      <div className="card card-pad">
        <div className="row spread wrap">
          <div>
            <div className="strong" style={{ fontSize: 15 }}>{prompts.length} prompts</div>
            <div className="small muted">Reusable prompts tuned for this project.</div>
          </div>
          <NewPromptForm projectId={project.id} />
        </div>
      </div>

      <div className="grid-2">
        {prompts.map((p) => (
          <div key={p.id} style={{ display: "flex", flexDirection: "column" }}>
            <PromptCard prompt={p} />
          </div>
        ))}
      </div>
      {prompts.length === 0 && (
        <Empty
          title="No prompts saved"
          sub="Save the prompts that work well so you can reuse them anytime."
        />
      )}
      <div className="small muted center">
        Looking for more? Browse the <Link className="card-link" href="/prompts">full prompt library →</Link>
      </div>
    </div>
  );
}
