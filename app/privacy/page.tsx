import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-12 text-[var(--text)]">
      <article className="mx-auto max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-9">
        <Link href="/signin" className="text-xs font-medium text-indigo-600">← Back to Ascend</Link>
        <h1 className="mt-6 text-3xl font-semibold">Privacy</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">Last updated August 9, 2026</p>
        <div className="mt-7 space-y-5 text-sm leading-7 text-[var(--muted)]">
          <p>Ascend stores the account details and self-improvement data you provide, including your profile, quests, progress, journal entries, guild activity, and notification subscriptions.</p>
          <p>This information is used only to provide Ascend’s account, progression, analytics, reminder, and optional AI features. Personal data is not sold.</p>
          <p>Optional integrations send only the information needed for their function to their configured provider. These integrations are disabled unless the operator configures them.</p>
          <p>You can export your progress from Settings. You can permanently delete your account and associated data from Settings → Delete account.</p>
          <p>Operational logs may retain limited security and error information for service reliability. Secrets, passwords, and reset tokens must not be written to application logs.</p>
          <p>Before public launch, replace this operator template with legal text appropriate for your jurisdiction and publish a monitored support address.</p>
        </div>
      </article>
    </main>
  );
}
