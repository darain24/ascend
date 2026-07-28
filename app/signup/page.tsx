import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Create account · Ascend" };

export default function SignUpPage() {
  return (
    <AuthShell title="Create your account" description="Start building your stats, streaks, and daily discipline.">
      <SignUpForm />
    </AuthShell>
  );
}
