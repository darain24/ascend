"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  createLocalAccount,
  resetLocalPassword,
  signInLocalAccount,
  validatePassword,
} from "@/lib/local-auth";
import { useHunterStore } from "@/store/use-hunter-store";

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function ErrorMessage({ message }: { message: string }) {
  return message ? <p className="text-xs text-rose-600">{message}</p> : null;
}

export function SignInForm() {
  const router = useRouter();
  const updateProfile = useHunterStore((state) => state.updateProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const account = await signInLocalAccount(email, password);
      updateProfile({ name: account.name, email: account.email });
      router.push("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Email</span>
          <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Password</span>
          <input className={inputClass} type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <div className="flex justify-end">
          <Link href="/reset-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
        </div>
        <ErrorMessage message={error} />
        <button disabled={submitting} className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        New to Ascend? <Link href="/signup" className="font-medium text-indigo-600">Create an account</Link>
      </p>
      <p className="mt-5 border-t border-[var(--line)] pt-5 text-center text-[10px] leading-5 text-[var(--muted)]">
        Accounts are stored only in this browser until a production authentication service is connected.
      </p>
    </>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const updateProfile = useHunterStore((state) => state.updateProfile);
  const resetJourney = useHunterStore((state) => state.resetJourney);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setError("Please enter a name with at least two characters.");
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const account = await createLocalAccount({ name: cleanName, email, password });
      resetJourney();
      updateProfile({ name: account.name, email: account.email });
      router.push("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Account creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Name</span>
          <input className={inputClass} autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Email</span>
          <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Password</span>
          <input className={inputClass} type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          <span className="mt-1.5 block text-[10px] text-[var(--muted)]">At least 8 characters, including a letter and a number.</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Confirm password</span>
          <input className={inputClass} type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </label>
        <ErrorMessage message={error} />
        <button disabled={submitting} className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Already have an account? <Link href="/signin" className="font-medium text-indigo-600">Sign in</Link>
      </p>
    </>
  );
}

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetLocalPassword(email, password);
      setPassword("");
      setConfirmPassword("");
      setNotice("Password reset. You can now sign in.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Password reset failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Account email</span>
          <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">New password</span>
          <input className={inputClass} type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium">Confirm new password</span>
          <input className={inputClass} type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </label>
        <ErrorMessage message={error} />
        {notice && <p className="text-xs text-emerald-600">{notice}</p>}
        <button disabled={submitting} className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
          {submitting ? "Resetting…" : "Reset password"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Remembered it? <Link href="/signin" className="font-medium text-indigo-600">Return to sign in</Link>
      </p>
      <p className="mt-5 border-t border-[var(--line)] pt-5 text-center text-[10px] leading-5 text-[var(--muted)]">
        This resets the account saved in this browser. Email-based recovery requires a production authentication provider.
      </p>
    </>
  );
}
