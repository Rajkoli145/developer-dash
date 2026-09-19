"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import { attachDocument } from "@/lib/actions";

export default function AttachDocPicker({
  documents, targetType, targetId,
}: {
  documents: { id: string; title: string }[];
  targetType: "task" | "session" | "decision";
  targetId: string;
}) {
  const [docId, setDocId] = useState("");
  const router = useRouter();

  if (documents.length === 0) return null;

  return (
    <form
      className="row mt-1"
      style={{ gap: 6 }}
      action={async (fd) => {
        await attachDocument(fd);
        setDocId("");
        router.refresh();
      }}
    >
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <select name="documentId" className="select" style={{ flex: 1, minWidth: 160 }} value={docId} onChange={(e) => setDocId(e.target.value)}>
        <option value="">Attach a document…</option>
        {documents.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
      </select>
      <button className="btn btn-outline btn-sm" type="submit" disabled={!docId}>
        <Paperclip size={13} /> Attach
      </button>
    </form>
  );
}
