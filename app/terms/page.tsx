import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-12 text-[var(--text)]">
      <article className="mx-auto max-w-2xl rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-9">
        <Link href="/signin" className="text-xs font-medium text-indigo-600">← Back to Ascend</Link>
        <h1 className="mt-6 text-3xl font-semibold">Terms</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">Last updated August 9, 2026</p>
        <div className="mt-7 space-y-5 text-sm leading-7 text-[var(--muted)]">
          <p>Ascend is a self-improvement tracking service, not medical, financial, or professional advice. Users remain responsible for choosing safe and appropriate goals.</p>
          <p>Do not use Ascend to harass others, automate abuse, compromise accounts, or submit unlawful content. Access may be restricted to protect users and service reliability.</p>
          <p>Progress, rankings, AI suggestions, and reminders are motivational features and may contain errors. Back up information you cannot afford to lose.</p>
          <p>The service may change or experience interruptions. Before public launch, replace this operator template with terms reviewed for your jurisdiction and business model.</p>
        </div>
      </article>
    </main>
  );
}
