"use client";

import { Camera, Check, LockKeyhole, Medal, Settings2, Sparkles, Trophy } from "lucide-react";
import { StatCard } from "../stat-card";
import { useHunterStore } from "@/store/use-hunter-store";
import type { StatKey } from "@/lib/game-logic/constants";

const achievements = [
  { title: "First step", detail: "Completed your first quest", icon: Sparkles, unlocked: true, color: "bg-indigo-50 text-indigo-600" },
  { title: "One full week", detail: "Maintained a 7-day streak", icon: Medal, unlocked: true, color: "bg-emerald-50 text-emerald-600" },
  { title: "One hundred", detail: "Completed 100 quests", icon: Trophy, unlocked: true, color: "bg-amber-50 text-amber-600" },
  { title: "Rank C", detail: "Reach Hunter Rank C", icon: Medal, unlocked: false, color: "bg-blue-50 text-blue-600" },
];

export function ProfileView() {
  const hunter = useHunterStore((state) => state.hunter);
  const sound = useHunterStore((state) => state.sound);
  const toggleSound = useHunterStore((state) => state.toggleSound);
  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Profile</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Your identity, achievements, and preferences.</p>
      </div>
      <section className="system-panel p-5 sm:p-7">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <div className="grid size-24 place-items-center rounded-full bg-[#dbe5dc] text-2xl font-semibold text-[#395442]">AQ</div>
            <button aria-label="Upload avatar" className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-white bg-slate-900 text-white"><Camera size={13} /></button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">Arin Qamar</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Novice Hunter · Level {hunter.level}</p>
            <span className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">Rank {hunter.rank}</span>
          </div>
          <div className="text-center sm:text-right"><p className="text-3xl font-semibold">{hunter.totalCompleted}</p><p className="mt-1 text-[11px] text-[var(--muted)]">quests completed</p></div>
        </div>
      </section>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <h2 className="text-sm font-semibold">Achievements</h2>
            <p className="mt-1 text-[11px] text-[var(--muted)]">3 of 18 unlocked</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {achievements.map(({ title, detail, icon: Icon, unlocked, color }) => (
                <div key={title} className={`relative rounded-2xl border border-[var(--line)] p-4 ${unlocked ? "" : "opacity-45"}`}>
                  <div className={`mb-4 grid size-9 place-items-center rounded-xl ${unlocked ? color : "bg-slate-100 text-slate-400"}`}>{unlocked ? <Icon size={16} /> : <LockKeyhole size={14} />}</div>
                  <h3 className="text-xs font-medium">{title}</h3><p className="mt-1 text-[10px] text-[var(--muted)]">{detail}</p>
                  {unlocked && <Check className="absolute right-4 top-4 text-emerald-600" size={13} />}
                </div>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{(Object.keys(hunter.stats) as StatKey[]).map((stat) => <StatCard key={stat} stat={stat} value={hunter.stats[stat]} />)}</div>
        </div>
        <aside className="system-panel h-fit p-5">
          <div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600"><Settings2 size={16} /></div><h2 className="text-sm font-semibold">Preferences</h2></div>
          <div className="mt-5 space-y-1">
            {[["Time zone", "Asia / Kolkata"], ["Daily reset", "12:00 AM"], ["Sound effects", sound ? "On" : "Off"], ["Theme", "Light"]].map(([label, value]) => (
              <button key={label} onClick={label === "Sound effects" ? toggleSound : undefined} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs transition hover:bg-[var(--bg)]"><span className="text-[var(--muted)]">{label}</span><span className="font-medium">{value}</span></button>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
