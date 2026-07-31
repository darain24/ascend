"use client";

import Pusher from "pusher-js";
import { Crown, Shield, Swords, UserPlus, Users } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";

type Leader = {
  level: number;
  rank: string;
  totalXpEarned: number;
  currentStreak: number;
  user: { id: string; name: string | null; displayName: string | null };
};
type Membership = {
  role: "OWNER" | "MEMBER";
  guild: {
    id: string;
    name: string;
    inviteCode: string;
    members: Array<{
      userId: string;
      role: "OWNER" | "MEMBER";
      user: { name: string | null; displayName: string | null; stats: { level: number; rank: string } | null };
    }>;
    raidBosses: Array<{ id: string; name: string; maxHp: number; currentHp: number; defeated: boolean; endsAt: string }>;
  };
};

export function GuildView() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const loadGuild = useCallback(async () => {
    const response = await fetch("/api/guilds");
    const result = (await response.json()) as { membership?: Membership | null; error?: string };
    if (!response.ok) throw new Error(result.error || "Guild could not be loaded.");
    setMembership(result.membership ?? null);
  }, []);

  useEffect(() => {
    void Promise.all([
      fetch("/api/leaderboard")
        .then((response) => response.ok ? response.json() : { rows: [] })
        .then((result: { rows?: Leader[] }) => setLeaders(result.rows ?? [])),
      loadGuild(),
    ]).catch((error) => setNotice(error instanceof Error ? error.message : "Guild data could not be loaded."));
  }, [loadGuild]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    const guildId = membership?.guild.id;
    if (!key || !cluster || !guildId) return;
    const pusher = new Pusher(key, {
      cluster,
      channelAuthorization: { endpoint: "/api/pusher/auth", transport: "ajax" },
    });
    const channel = pusher.subscribe(`private-guild-${guildId}`);
    const reload = () => void loadGuild();
    channel.bind("member-joined", reload);
    channel.bind("raid-created", reload);
    channel.bind("raid-damaged", reload);
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-guild-${guildId}`);
      pusher.disconnect();
    };
  }, [membership?.guild.id, loadGuild]);

  async function submit(path: string, payload: object) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Guild request failed.");
      await loadGuild();
      setName("");
      setInviteCode("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Guild request failed.");
    } finally {
      setBusy(false);
    }
  }

  const raid = membership?.guild.raidBosses[0];
  const raidProgress = raid ? Math.round(((raid.maxHp - raid.currentHp) / raid.maxHp) * 100) : 0;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Guilds</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Progress together, contribute to raids, and climb the ranks.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Users size={16} /></div><div><h2 className="text-sm font-semibold">{membership ? membership.guild.name : "Find your guild"}</h2><p className="mt-0.5 text-[10px] text-[var(--muted)]">{membership ? `${membership.guild.members.length} hunters · Invite ${membership.guild.inviteCode}` : "Create a group or enter a private invite code."}</p></div></div>
            {!membership ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <form onSubmit={(event: FormEvent) => { event.preventDefault(); void submit("/api/guilds", { name }); }} className="rounded-2xl border border-[var(--line)] p-4">
                  <Shield size={17} className="text-indigo-600" /><p className="mt-3 text-xs font-semibold">Create guild</p>
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Guild name" className="mt-3 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs outline-none" required />
                  <button disabled={busy} className="mt-3 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-medium text-white disabled:opacity-60">Create</button>
                </form>
                <form onSubmit={(event: FormEvent) => { event.preventDefault(); void submit("/api/guilds/join", { inviteCode }); }} className="rounded-2xl border border-[var(--line)] p-4">
                  <UserPlus size={17} className="text-emerald-600" /><p className="mt-3 text-xs font-semibold">Join guild</p>
                  <input value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Invite code" className="mt-3 h-10 w-full rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-xs uppercase outline-none" required />
                  <button disabled={busy} className="mt-3 w-full rounded-xl border border-[var(--line)] py-2.5 text-xs font-medium disabled:opacity-60">Join</button>
                </form>
              </div>
            ) : (
              <div className="mt-5 space-y-2">
                {membership.guild.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3">
                    <div><p className="text-xs font-medium">{member.user.displayName || member.user.name || "Hunter"}</p><p className="mt-0.5 text-[9px] text-[var(--muted)]">{member.role.toLowerCase()} · Level {member.user.stats?.level ?? 1}</p></div>
                    <span className="text-[10px] font-medium text-indigo-600">Rank {member.user.stats?.rank ?? "E"}</span>
                  </div>
                ))}
              </div>
            )}
            {notice && <p className="mt-4 text-xs text-amber-600">{notice}</p>}
          </section>
          <section className="system-panel p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Raid boss</h2><p className="mt-1 text-[10px] text-[var(--muted)]">Completed quest XP automatically becomes raid damage.</p></div><Swords size={18} className="text-rose-500" /></div>
            {raid ? (
              <div className="mt-6 rounded-2xl border border-[var(--line)] p-5">
                <div className="flex items-center justify-between"><p className="text-sm font-medium">{raid.name}</p><p className="text-[10px] text-[var(--muted)]">{raid.currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()} HP</p></div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${raidProgress}%` }} /></div>
                <p className="mt-2 text-[10px] text-[var(--muted)]">{raidProgress}% defeated · Ends {new Date(raid.endsAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-[var(--line)] px-5 py-9 text-center"><p className="text-sm font-medium">No active raid</p><p className="mt-1 text-xs text-[var(--muted)]">The weekly raid job creates the next guild challenge.</p></div>
            )}
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
