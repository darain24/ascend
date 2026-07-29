"use client";

import { Crown, Shield, Swords, UserPlus, Users } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

type Leader = {
  level: number;
  rank: string;
  totalXpEarned: number;
  currentStreak: number;
  user: { id: string; name: string | null; displayName: string | null };
};

export function GuildView() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void fetch("/api/leaderboard")
      .then((response) => response.ok ? response.json() : { rows: [] })
      .then((result: { rows?: Leader[] }) => setLeaders(result.rows ?? []))
      .catch(() => setLeaders([]));
  }, []);

  function requireSyncedAccount(event: FormEvent) {
    event.preventDefault();
    setNotice("Guild membership requires the database-backed Auth.js session configured for deployment.");
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Guilds</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Progress together, contribute to raids, and climb the ranks.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Users size={16} /></div><div><h2 className="text-sm font-semibold">Find your guild</h2><p className="mt-0.5 text-[10px] text-[var(--muted)]">Create a group or enter a private invite code.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <form onSubmit={requireSyncedAccount} className="rounded-2xl border border-[var(--line)] p-4">
                <Shield size={17} className="text-indigo-600" />
                <p className="mt-3 text-xs font-semibold">Create guild</p>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Guild name" className="mt-3 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs outline-none" required />
                <button className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-medium text-white">Create</button>
              </form>
              <form onSubmit={requireSyncedAccount} className="rounded-2xl border border-[var(--line)] p-4">
                <UserPlus size={17} className="text-emerald-600" />
                <p className="mt-3 text-xs font-semibold">Join guild</p>
                <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Invite code" className="mt-3 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs uppercase outline-none" required />
                <button className="mt-3 w-full rounded-xl border border-[var(--line)] py-2.5 text-xs font-medium">Join</button>
              </form>
            </div>
            {notice && <p className="mt-4 text-xs text-amber-600">{notice}</p>}
          </section>
          <section className="system-panel p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Raid boss</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Guild quest XP converts directly into raid damage.</p></div><Swords size={18} className="text-rose-500" /></div>
            <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] px-5 py-9 text-center"><p className="text-sm font-medium">No active raid</p><p className="mt-1 text-xs text-[var(--muted)]">Weekly raids appear after you join a guild.</p></div>
          </section>
        </div>
        <section className="system-panel p-5 sm:p-6">
          <div className="flex items-center gap-3"><Crown size={17} className="text-amber-500" /><div><h2 className="text-sm font-semibold">Global leaderboard</h2><p className="mt-0.5 text-[10px] text-[var(--muted)]">Cached for 60 seconds.</p></div></div>
          <div className="mt-5 space-y-2">
            {leaders.map((leader, index) => (
              <div key={leader.user.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3">
                <span className="grid size-7 place-items-center rounded-lg bg-[var(--bg)] text-[10px] font-semibold">{index + 1}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{leader.user.displayName || leader.user.name || "Hunter"}</p><p className="mt-0.5 text-[9px] text-[var(--muted)]">Level {leader.level} · Rank {leader.rank}</p></div>
                <p className="text-[10px] font-medium text-indigo-600">{leader.totalXpEarned.toLocaleString()} XP</p>
              </div>
            ))}
            {leaders.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-9 text-center"><p className="text-sm font-medium">No ranked hunters yet</p><p className="mt-1 text-xs text-[var(--muted)]">The leaderboard begins empty.</p></div>}
          </div>
        </section>
      </div>
    </>
  );
}
