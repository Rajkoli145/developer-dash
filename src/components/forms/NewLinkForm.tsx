"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createLink } from "@/lib/actions";
import { LINK_KINDS, LINK_KIND_LABEL } from "@/lib/constants";

export default function NewLinkForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!open) {
    return (
      <button className="btn btn-outline btn-sm mt-2" onClick={() => setOpen(true)}>
        <Plus size={14} /> Add link
      </button>
    );
  }

  return (
    <form
      className="row wrap mt-2"
      style={{ gap: 8 }}
      action={async (fd) => { await createLink(fd); setOpen(false); router.refresh(); }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input name="label" className="input" style={{ width: 200 }} placeholder="Label" required />
      <input name="url" className="input" style={{ width: 320 }} placeholder="https://…" type="url" required />
      <select name="kind" className="select" style={{ width: 150 }} defaultValue="LINK">
        {LINK_KINDS.map((k) => <option key={k} value={k}>{LINK_KIND_LABEL[k]}</option>)}
      </select>
      <button type="submit" className="btn btn-primary btn-sm">Save</button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
    </form>
  );
}
