import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = { title: "Verify email · Ascend" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" description="Confirm your address before continuing your Ascend journey.">
      <Suspense fallback={<p className="mt-6 text-sm text-[var(--muted)]">Loading verification…</p>}><VerifyEmailForm /></Suspense>
    </AuthShell>
  );
}
