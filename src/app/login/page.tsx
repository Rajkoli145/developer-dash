"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, KeyRound, Loader2 } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "password" | "claimed">("loading");
  const [passkeyReady, setPasskeyReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const triedAuto = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/status").then((r) => r.json()),
      fetch("/api/auth/passkey/authenticate").then((r) => r.json()).catch(() => ({ available: false })),
    ]).then(([status, pk]) => {
      setMode(status.claimed ? "password" : "claimed");
      setPasskeyReady(Boolean(pk.available));
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const signInWithPasskey = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/passkey/authenticate");
      const options = await res.json();
      if (!options?.options) {
        setError("No passkey available. Use your password.");
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: options.options });
      const verify = await fetch("/api/auth/passkey/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assertion),
      });
      if (!verify.ok) {
        const d = await verify.json().catch(() => ({}));
        setError(d.error ?? "Fingerprint didn't verify.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Fingerprint canceled or unavailable.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand"><span className="brand-mark">DC</span> DevContext</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your workspace.</p>

        {mode === "loading" && <div className="auth-note"><Loader2 size={15} className="spin" /> Loading…</div>}
        {mode === "claimed" && (
          <div className="auth-note">
            First time here? <a href="/setup">Set up your workspace →</a>
          </div>
        )}

        {mode === "password" && (
          <>
            {passkeyReady && (
              <button className="btn btn-outline auth-passkey" onClick={signInWithPasskey} disabled={busy}>
                <Fingerprint size={18} />
                {busy ? "Waiting for fingerprint…" : "Sign in with fingerprint"}
              </button>
            )}
            {passkeyReady && <div className="auth-or"><span>or use password</span></div>}
            <form onSubmit={submit} className="auth-form">
              <div className="field">
                <label htmlFor="li-email">Email</label>
                <input id="li-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="li-pass">Password</label>
                <input id="li-pass" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button className="btn btn-primary auth-submit" disabled={busy}>
                <KeyRound size={16} />
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
