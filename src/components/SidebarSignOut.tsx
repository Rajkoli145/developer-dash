"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

/**
 * Sidebar sign-out. Signing out only clears the session — every project, task,
 * document, and upload lives in Postgres and is untouched.
 */
export default function SidebarSignOut({ onClose }: { onClose?: () => void }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const signOut = async () => {
    setBusy(true);
    onClose?.();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="nav-item signout-btn" onClick={signOut} disabled={busy} aria-label="Sign out">
      <span className="nav-ico">
        {busy ? <Loader2 size={17} className="spin" /> : <LogOut size={17} />}
      </span>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
