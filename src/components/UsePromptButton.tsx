"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MousePointerClick } from "lucide-react";
import { usePrompt } from "@/lib/actions";

export default function UsePromptButton({ promptId }: { promptId: string }) {
  const [done, setDone] = useState(false);
  const router = useRouter();

  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={async () => {
        const fd = new FormData();
        fd.set("id", promptId);
        await usePrompt(fd);
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? <Check size={14} /> : <MousePointerClick size={14} />}
      {done ? "Recorded" : "Mark used"}
    </button>
  );
}
