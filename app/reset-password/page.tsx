import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset password · Ascend" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset your password" description="Choose a new password for your local Ascend account.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
