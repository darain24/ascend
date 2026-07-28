import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignInForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Sign in · Ascend" };

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back" description="Sign in to continue your progress.">
      <SignInForm />
    </AuthShell>
  );
}
