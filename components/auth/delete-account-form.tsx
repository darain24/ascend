"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function DeleteAccountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function removeAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Account could not be deleted.");
      localStorage.removeItem("ascend-user-profile");
      await signOut({ redirect: false });
      router.replace("/signup");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Account could not be deleted.");
    } finally {
      setDeleting(false);
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="mt-3 w-full rounded-xl border border-rose-200 py-2.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50">Delete account</button>;
  }

  return (
    <form onSubmit={removeAccount} className="mt-3 rounded-xl border border-rose-200 bg-rose-50/40 p-4">
      <p className="text-xs font-semibold text-rose-700">Permanently delete your account</p>
      <p className="mt-1 text-[10px] leading-5 text-rose-700/80">This removes your profile, quests, progress, journal, guild membership, and uploaded avatar. This cannot be undone.</p>
      <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Current password" className="mt-3 h-10 w-full rounded-lg border border-rose-200 bg-white px-3 text-xs outline-none focus:border-rose-400" />
      <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Type DELETE" className="mt-2 h-10 w-full rounded-lg border border-rose-200 bg-white px-3 text-xs outline-none focus:border-rose-400" />
      {error && <p className="mt-2 text-[10px] text-rose-700">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button type="submit" disabled={deleting || confirmation !== "DELETE"} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50">{deleting ? "Deleting…" : "Delete permanently"}</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700">Cancel</button>
      </div>
    </form>
  );
}
