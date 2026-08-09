"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function VerifyEmailForm() {
  const search = useSearchParams();
  const identifier = search.get("identifier") ?? "";
  const token = search.get("token") ?? "";
  const [email, setEmail] = useState(search.get("email") ?? "");
  const [message, setMessage] = useState(search.get("sent") ? "Check your inbox for the verification link." : "");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(Boolean(identifier && token));

  useEffect(() => {
    if (!identifier || !token) return;
    void (async () => {
      try {
        const response = await fetch("/api/account/verify-email/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ identifier, token }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error || "Email could not be verified.");
        setMessage("Your email is verified. You can now sign in.");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Email could not be verified.");
      } finally {
        setWorking(false);
      }
    })();
  }, [identifier, token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/account/verify-email/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error || "Verification email could not be sent.");
      setMessage(result.message || "If that account exists, a verification link has been sent.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Verification email could not be sent.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      {working && identifier && <p className="mt-6 text-sm text-[var(--muted)]">Verifying your email…</p>}
      {message && <p className="mt-6 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
      {error && <p className="mt-6 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {!identifier && (
        <form onSubmit={resend} className="mt-6 space-y-3">
          <label className="block"><span className="mb-2 block text-xs font-medium">Account email</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-[var(--line)] bg-transparent px-3 text-sm outline-none focus:border-indigo-400" /></label>
          <button disabled={working} className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white disabled:opacity-60">{working ? "Sending…" : "Send verification link"}</button>
        </form>
      )}
      <p className="mt-5 text-center text-xs text-[var(--muted)]"><Link href="/signin" className="font-medium text-indigo-600">Return to sign in</Link></p>
    </>
  );
}
