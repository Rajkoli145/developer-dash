"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Plus, Trash2, Loader2 } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";

type Cred = { id: string; label: string | null; deviceType: string; createdAt: string; lastUsedAt: string | null };

export default function PasskeyManager() {
  const [creds, setCreds] = useState<Cred[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(() => {
    fetch("/api/auth/passkey")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCreds)
      .catch(() => setCreds([]));
  }, []);

  useEffect(load, [load]);

  const register = async () => {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const res = await fetch("/api/auth/passkey/register");
      if (res.status === 401) { setErr("Sign in first."); return; }
      const options = await res.json();
      const attestation = await startRegistration({ optionsJSON: options });
      const label = window.prompt("Name this device (e.g. \"MacBook Pro Touch ID\")", "This device") || "This device";
      const verify = await fetch("/api/auth/passkey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...attestation, label }),
      });
      if (!verify.ok) {
        const d = await verify.json().catch(() => ({}));
        setErr(d.error ?? "Registration failed.");
        return;
      }
      setMsg("Passkey saved — next login can use your fingerprint.");
      load();
      router.refresh();
    } catch {
      setErr("Fingerprint setup was canceled or isn't available on this device.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await fetch("/api/auth/passkey", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <section className="card card-pad">
      <div className="card-head">
        <h3 className="card-title" style={{ fontSize: 15.5 }}>
          <span className="row" style={{ gap: 7 }}><Fingerprint size={15} /> Passkeys (fingerprint sign-in)</span>
        </h3>
        <button className="btn btn-gold btn-sm" onClick={register} disabled={busy}>
          {busy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />}
          {busy ? "Follow the prompt…" : "Add passkey"}
        </button>
      </div>
      <p className="small muted">
        A passkey uses your device&apos;s fingerprint reader (Touch ID) or the keychain. Register one and you can
        sign in without typing your password.
      </p>
      {msg && <div className="auth-note mt-2" style={{ color: "var(--green)" }}>{msg}</div>}
      {err && <div className="auth-error mt-2">{err}</div>}
      <div className="stack-sm mt-2">
        {creds?.map((c) => (
          <div key={c.id} className="row-item" style={{ border: "1px solid var(--line)" }}>
            <span className="stat-ico ico-blue"><Fingerprint size={15} /></span>
            <span className="row-grow">
              <span className="row-title">{c.label ?? "Passkey"}</span>
              <span className="row-sub" style={{ display: "block" }}>
                {c.deviceType === "multiDevice" ? "synced via keychain" : "this device only"}
                {c.lastUsedAt ? ` · last used ${new Date(c.lastUsedAt).toLocaleDateString()}` : ""}
              </span>
            </span>
            <button className="btn btn-ghost btn-icon" onClick={() => remove(c.id)} aria-label="Remove passkey">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {creds && creds.length === 0 && (
          <div className="small muted">No passkeys yet — add one to enable fingerprint sign-in.</div>
        )}
      </div>
    </section>
  );
}
