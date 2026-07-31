import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Reset password · Ascend" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset your password" description="Request a secure reset link for your Ascend account.">
      <Suspense fallback={<p className="mt-6 text-xs text-[var(--muted)]">Loading…</p>}><ResetPasswordForm /></Suspense>
    </AuthShell>
  );
}
