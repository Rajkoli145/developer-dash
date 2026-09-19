"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, KeyRound, Loader2, Check, ShieldCheck, FolderKanban, Bot } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "password" | "claimed">("loading");
  const [passkeyReady, setPasskeyReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const triedAuto = useRef(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/status").then((r) => r.json()),
      fetch("/api/auth/passkey/authenticate").then((r) => r.json()).catch(() => ({ available: false })),
    ]).then(([status, pk]) => {
      setMode(status.claimed ? "password" : "claimed");
      setPasskeyReady(Boolean(pk.available));
      // Fingerprint-first: kick off the WebAuthn prompt as soon as the page loads.
      if (status.claimed && pk.available && !triedAuto.current) {
        triedAuto.current = true;
        void signInWithPasskey();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 550);
  };

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
      finish();
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
        if (!triedAuto.current) setError("No passkey available. Use your password.");
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
      finish();
    } catch {
      if (!triedAuto.current) setError("Fingerprint canceled or unavailable.");
      else setError("Touch your fingerprint sensor to sign in — or use your password below.");
    } finally {
      triedAuto.current = false;
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="auth-blob b1" />
        <div className="auth-blob b2" />
        <div className="auth-side-inner">
          <div className="auth-brand light"><span className="brand-mark">DC</span> DevContext</div>
          <h2 className="auth-side-title">Your project brain,<br />one secure place.</h2>
          <p className="auth-side-sub">Projects, tasks, documents, AI sessions and handoffs — locked behind your fingerprint.</p>
          <ul className="auth-feats">
            <li style={{ "--i": 0 } as React.CSSProperties}><FolderKanban size={15} /> Projects with full context</li>
            <li style={{ "--i": 1 } as React.CSSProperties}><Bot size={15} /> AI session memory</li>
            <li style={{ "--i": 2 } as React.CSSProperties}><ShieldCheck size={15} /> Private to you only</li>
          </ul>
        </div>
      </aside>

      <div className="auth-card">
        <div className="auth-brand"><span className="brand-mark">DC</span> DevContext</div>

        {mode === "loading" && <div className="auth-note"><Loader2 size={15} className="spin" /> Loading…</div>}

        {mode === "claimed" && (
          <>
            <h1 className="auth-title">Almost there</h1>
            <p className="auth-sub">Set up your workspace to continue.</p>
            <div className="auth-note">
              First time here? <a href="/setup">Set up your workspace →</a>
            </div>
          </>
        )}

        {mode === "password" && (
          <>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to your workspace.</p>

            {passkeyReady && (
              <button className="btn btn-outline auth-passkey" onClick={signInWithPasskey} disabled={busy || done}>
                <Fingerprint size={18} className="fp-ico" />
                {busy ? "Waiting for fingerprint…" : "Sign in with fingerprint"}
              </button>
            )}
            {passkeyReady && <div className="auth-or"><span>or use password</span></div>}

            <form onSubmit={submit} className="auth-form">
              <div className="field stagger" style={{ "--i": 0 } as React.CSSProperties}>
                <label htmlFor="li-email">Email</label>
                <input id="li-email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="field stagger" style={{ "--i": 1 } as React.CSSProperties}>
                <label htmlFor="li-pass">Password</label>
                <input id="li-pass" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button className={`btn auth-submit ${done ? "btn-ok" : "btn-primary"} stagger`} style={{ "--i": 2 } as React.CSSProperties} disabled={busy || done}>
                {done ? <><Check size={16} /> Signed in — opening…</> : <><KeyRound size={16} /> {busy ? "Signing in…" : "Sign in"}</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
