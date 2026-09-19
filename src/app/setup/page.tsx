"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Fingerprint, Loader2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "claimed">("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setStatus(d.claimed ? "claimed" : "ready"))
      .catch(() => setStatus("ready"));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Setup failed.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand"><span className="brand-mark">DC</span> DevContext</div>
        <h1 className="auth-title">Set up your workspace</h1>
        <p className="auth-sub">One account — yours. You&apos;ll add a fingerprint passkey right after.</p>

        {status === "loading" && <div className="auth-note"><Loader2 size={15} className="spin" /> Checking workspace…</div>}
        {status === "claimed" && (
          <div className="auth-note">
            This workspace is already set up. <a href="/login">Sign in →</a>
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={submit} className="auth-form">
            <div className="field">
              <label htmlFor="su-name">Your name</label>
              <input id="su-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Raj Koli" autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="su-email">Email</label>
              <input id="su-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="su-pass">Password <span className="muted">(min 8 characters)</span></label>
              <input id="su-pass" className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="su-confirm">Confirm password</label>
              <input id="su-confirm" className="input" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="btn btn-primary auth-submit" disabled={busy}>
              <ShieldCheck size={16} />
              {busy ? "Setting up…" : "Create my workspace"}
            </button>
            <div className="auth-hint">
              <Fingerprint size={13} /> After setup you can register a passkey — sign in next time with Touch ID / fingerprint, no password.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
