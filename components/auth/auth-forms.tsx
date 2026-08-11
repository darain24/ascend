"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useEffect, useState } from "react";
import { validatePassword } from "@/lib/security/password";
import { useHunterStore } from "@/store/use-hunter-store";

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function ErrorMessage({ message }: { message: string }) {
  return message ? <p className="text-xs text-rose-600">{message}</p> : null;
}

function GoogleAuthButton({ mode }: { mode: "signin" | "signup" }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    void fetch("/api/auth/providers")
      .then((response) => response.json())
      .then((providers: Record<string, unknown>) => setEnabled(Boolean(providers.google)))
      .catch(() => undefined);
  }, []);

  if (!enabled) return null;

  function continueWithGoogle() {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `ascend-oauth-timezone=${encodeURIComponent(timezone)}; Path=/; Max-Age=600; SameSite=Lax`;
    void signIn("google", { callbackUrl: "/" });
  }

  return (
    <>
      <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span>or</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>
      <button type="button" onClick={continueWithGoogle} className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] text-sm font-medium transition hover:bg-[var(--bg)]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.63A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.44H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.56l3.35-2.63Z" />
          <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.44l3.35 2.63C7.18 7.7 9.39 5.94 12 5.94Z" />
        </svg>
        {mode === "signup" ? "Sign up with Google" : "Continue with Google"}
      </button>
    </>
  );
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
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (result?.error) throw new Error("The email or password is incorrect.");
      updateProfile({ email: email.trim().toLowerCase() });
      router.push(result?.url || "/");
      router.refresh();
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
      <GoogleAuthButton mode="signin" />
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        New to Ascend? <Link href="/signup" className="font-medium text-indigo-600">Create an account</Link>
      </p>
      <p className="mt-5 border-t border-[var(--line)] pt-5 text-center text-[10px] leading-5 text-[var(--muted)]">
        Your session is encrypted and your progress is linked to your Ascend account.
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
      const response = await fetch("/api/account/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email,
          password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      const result = (await response.json().catch(() => ({ error: "The server returned an invalid response." }))) as { error?: string; verificationRequired?: boolean };
      if (!response.ok) throw new Error(result.error || "Account creation failed.");
      if (result.verificationRequired) {
        router.push(`/verify-email?sent=1&email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }
      const authResult = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
      if (authResult?.error) throw new Error("Account created, but sign in failed.");
      resetJourney();
      updateProfile({ name: cleanName, email: email.trim().toLowerCase() });
      router.push("/");
      router.refresh();
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
      <GoogleAuthButton mode="signup" />
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Already have an account? <Link href="/signin" className="font-medium text-indigo-600">Sign in</Link>
      </p>
    </>
  );
}

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tokenEmail = searchParams.get("email") ?? "";
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
    setSubmitting(true);
    try {
      if (!token) {
        const response = await fetch("/api/account/reset-password/request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = (await response.json()) as { message?: string; error?: string };
        if (!response.ok) throw new Error(result.error || "Reset request failed.");
        setNotice(result.message || "If that account exists, a reset link has been sent.");
        return;
      }
      const passwordError = validatePassword(password);
      if (passwordError) throw new Error(passwordError);
      if (password !== confirmPassword) throw new Error("The passwords do not match.");
      const response = await fetch("/api/account/reset-password/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: tokenEmail, token, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Password reset failed.");
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
        {!token ? (
          <label className="block">
            <span className="mb-2 block text-xs font-medium">Account email</span>
            <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        ) : (
          <>
            <p className="rounded-xl bg-[var(--bg)] p-3 text-xs text-[var(--muted)]">Resetting the password for {tokenEmail}.</p>
            <label className="block">
              <span className="mb-2 block text-xs font-medium">New password</span>
              <input className={inputClass} type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium">Confirm new password</span>
              <input className={inputClass} type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
            </label>
          </>
        )}
        <ErrorMessage message={error} />
        {notice && <p className="text-xs text-emerald-600">{notice}</p>}
        <button disabled={submitting} className="h-11 w-full rounded-xl bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60">
          {submitting ? "Working…" : token ? "Reset password" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Remembered it? <Link href="/signin" className="font-medium text-indigo-600">Return to sign in</Link>
      </p>
      <p className="mt-5 border-t border-[var(--line)] pt-5 text-center text-[10px] leading-5 text-[var(--muted)]">
        Reset links expire after 30 minutes and can only be used once.
      </p>
    </>
  );
}
