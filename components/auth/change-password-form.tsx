"use client";

import { KeyRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { validatePassword } from "@/lib/security/password";

export function ChangePasswordForm({
  name,
  email,
  showHeading = true,
}: {
  name: string;
  email: string;
  showHeading?: boolean;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The password could not be updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice("Password changed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The password could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <>
      {showHeading && (
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <KeyRound size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Change password</h2>
            <p className="mt-0.5 text-[10px] text-[var(--muted)]">For {email}</p>
          </div>
        </div>
      )}
      <form className={showHeading ? "mt-5 space-y-4" : "space-y-4"} onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Current password</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">New password</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <span className="mt-1.5 block text-[10px] text-[var(--muted)]">At least 8 characters, including a letter and a number.</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Confirm new password</span>
          <input
            className={inputClass}
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {notice && <p className="text-xs text-emerald-600">{notice}</p>}
        <button disabled={saving} className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-medium text-white disabled:opacity-60">
          {saving ? "Saving…" : "Change password"}
        </button>
      </form>
      <p className="mt-4 text-[9px] leading-relaxed text-[var(--muted)]">
        Passwords are hashed on the server and never stored in browser storage.
      </p>
    </>
  );
}
