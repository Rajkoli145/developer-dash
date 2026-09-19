"use client";

import CopyButton from "./CopyButton";
import { FileDown, FileJson } from "lucide-react";

export default function HandoffActions({ handoffId }: { handoffId: string }) {
  return (
    <div className="row" style={{ gap: 8 }}>
      <CopyButton url={`/api/handoff/${handoffId}`} label="Copy handoff" asLink />
      <a className="btn btn-outline btn-sm" href={`/api/handoff/${handoffId}`} download>
        <FileDown size={14} /> .md
      </a>
      <a className="btn btn-outline btn-sm" href={`/api/handoff/${handoffId}?format=json`} download>
        <FileJson size={14} /> .json
      </a>
    </div>
  );
}
