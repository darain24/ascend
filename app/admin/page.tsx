"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

type Health = {
  status: string;
  users: number;
  quests: number;
  checkedAt: string;
  jobs: Array<{ id: string; job: string; status: string; startedAt: string }>;
  errors: Array<{ id: string; source: string; message: string; createdAt: string }>;
  levels: Array<{ level: number; _count: { level: number } }>;
};

export default function AdminPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState("");

  async function loadHealth() {
    setError("");
    const response = await fetch("/api/admin/health");
    if (!response.ok) {
      setHealth(null);
      setError(response.status === 403 ? "This signed-in account is not an administrator." : "Health data could not be loaded.");
      return;
    }
    setHealth((await response.json()) as Health);
  }

  useEffect(() => {
    void loadHealth();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-8 flex w-fit items-center gap-2 text-sm font-semibold"><span className="grid size-8 place-items-center rounded-xl bg-indigo-600 text-white"><TrendingUp size={16} /></span>Ascend admin</Link>
        <section className="system-panel p-5 sm:p-6">
          <h1 className="text-xl font-semibold">System health</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">Restricted to the signed-in account configured by ADMIN_EMAIL.</p>
          <button onClick={loadHealth} className="mt-5 h-10 rounded-xl bg-slate-900 px-5 text-xs font-medium text-white">Refresh health</button>
          {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
        </section>
        {health && (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="system-panel p-5"><p className="text-xs text-[var(--muted)]">Users</p><p className="mt-2 text-3xl font-semibold">{health.users}</p><p className="mt-5 text-xs text-[var(--muted)]">Quests</p><p className="mt-2 text-3xl font-semibold">{health.quests}</p></section>
            <section className="system-panel p-5"><h2 className="text-sm font-semibold">Level distribution</h2><div className="mt-4 space-y-2">{health.levels.map((row) => <div key={row.level} className="flex items-center gap-3 text-xs"><span className="w-14 text-[var(--muted)]">Level {row.level}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg)]"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.max(5, (row._count.level / Math.max(1, health.users)) * 100)}%` }} /></div><span>{row._count.level}</span></div>)}</div></section>
            <section className="system-panel p-5 lg:col-span-2"><h2 className="text-sm font-semibold">Recent jobs</h2><div className="mt-4 space-y-2">{health.jobs.map((job) => <div key={job.id} className="flex justify-between rounded-xl bg-[var(--bg)] p-3 text-xs"><span>{job.job}</span><span className="text-[var(--muted)]">{job.status}</span></div>)}{!health.jobs.length && <p className="text-xs text-[var(--muted)]">No job runs recorded.</p>}</div></section>
            <section className="system-panel p-5 lg:col-span-2"><h2 className="text-sm font-semibold">Recent errors</h2><div className="mt-4 space-y-2">{health.errors.map((item) => <div key={item.id} className="rounded-xl bg-[var(--bg)] p-3"><p className="text-xs font-medium">{item.source}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{item.message}</p></div>)}{!health.errors.length && <p className="text-xs text-[var(--muted)]">No errors recorded.</p>}</div></section>
          </div>
        )}
      </div>
    </main>
  );
}
