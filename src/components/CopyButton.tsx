"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  text, url, label = "Copy", className = "btn btn-outline btn-sm", asLink = false,
}: {
  text?: string;
  url?: string;
  label?: string;
  className?: string;
  asLink?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    let content = text ?? "";
    if (!content && url) {
      const res = await fetch(url);
      content = await res.text();
    }
    try { await navigator.clipboard.writeText(content); } catch {
      const ta = document.createElement("textarea");
      ta.value = content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (asLink) {
    return (
      <a
        className={className}
        onClick={(e) => { e.preventDefault(); onCopy(); }}
        href="#"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : label}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}
