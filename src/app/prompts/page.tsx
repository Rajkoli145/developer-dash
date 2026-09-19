import Link from "next/link";
import { MessageSquareCode } from "lucide-react";
import { db } from "@/lib/db";
import { PROMPT_CATEGORIES } from "@/lib/constants";
import { Empty } from "@/components/ui";
import NewPromptForm from "@/components/forms/NewPromptForm";
import PromptCard from "@/components/PromptCard";

export const dynamic = "force-dynamic";

export default async function PromptsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const prompts = await db.prompt.findMany({
    where: category ? { category } : undefined,
    orderBy: { usageCount: "desc" },
    include: { project: true },
  });
  const projects = await db.project.findMany({ select: { id: true, name: true, key: true }, orderBy: { name: "asc" } });

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1 className="page-title">Prompt Library</h1>
          <p className="page-sub">{prompts.length} reusable prompts · copy straight into any agent</p>
        </div>
        <NewPromptForm projects={projects} />
      </div>

      <div className="row wrap" style={{ gap: 6 }}>
        <Link href="/prompts" className={`chip chip-btn ${!category ? "on" : ""}`}>All</Link>
        {PROMPT_CATEGORIES.map((c) => (
          <Link key={c} href={`/prompts?category=${encodeURIComponent(c)}`} className={`chip chip-btn ${category === c ? "on" : ""}`}>
            {c}
          </Link>
        ))}
      </div>

      <div className="grid-2">
        {prompts.map((p) => <PromptCard key={p.id} prompt={p} />)}
      </div>
      {prompts.length === 0 && <Empty icon={<MessageSquareCode size={20} />} title="No prompts in this category" sub="Save a prompt to start building your library." />}
    </div>
  );
}
