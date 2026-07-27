"use client";

import { Camera, Check, Crown, LockKeyhole, Medal, Settings2, Shield, Sparkles, Trophy } from "lucide-react";
import { RankEmblem } from "../rank-emblem";
import { StatCard } from "../stat-card";
import { useHunterStore } from "@/store/use-hunter-store";
import type { StatKey } from "@/lib/game-logic/constants";

const achievements = [
  { title: "First Awakening", detail: "Complete your first quest", icon: Sparkles, unlocked: true, color: "text-cyan-300" },
  { title: "Unbroken", detail: "Maintain a 7-day streak", icon: Shield, unlocked: true, color: "text-emerald-300" },
  { title: "Centurion", detail: "Complete 100 quests", icon: Trophy, unlocked: true, color: "text-amber-300" },
  { title: "Rank C Hunter", detail: "Reach Hunter Rank C", icon: Medal, unlocked: false, color: "text-blue-300" },
  { title: "Dungeon Master", detail: "Clear 10 weekly dungeons", icon: Crown, unlocked: false, color: "text-purple-300" },
  { title: "Monarch's Will", detail: "Maintain a 100-day streak", icon: Crown, unlocked: false, color: "text-rose-300" },
];

export function ProfileView() {
  const hunter = useHunterStore((state) => state.hunter);
  const sound = useHunterStore((state) => state.sound);
  const toggleSound = useHunterStore((state) => state.toggleSound);

  return (
    <>
      <div className="mb-7">
        <p className="system-font text-[9px] font-bold tracking-[0.3em] text-blue-400">IDENTITY RECORD</p>
        <h1 className="system-font mt-2 text-2xl font-black sm:text-3xl">HUNTER PROFILE</h1>
      </div>
      <section className="system-panel overflow-hidden p-5 sm:p-8">
        <div className="absolute right-0 top-0 size-96 bg-[radial-gradient(circle_at_center,rgba(59,130,246,.11),transparent_68%)]" />
        <div className="relative flex flex-col items-center gap-7 text-center sm:flex-row sm:text-left">
          <div className="relative">
            <div className="grid size-28 place-items-center border border-blue-300/30 bg-gradient-to-br from-blue-500/30 to-cyan-300/5 system-font text-3xl font-black text-cyan-200 shadow-[0_0_34px_rgba(59,130,246,.18)]">AQ</div>
            <button aria-label="Upload avatar" className="absolute -bottom-2 -right-2 grid size-9 place-items-center border border-blue-400/40 bg-[#0b1727] text-blue-200">
              <Camera size={15} />
            </button>
          </div>
          <div className="flex-1">
            <p className="system-font text-[8px] tracking-[0.24em] text-blue-400">REGISTERED HUNTER</p>
            <h2 className="system-font mt-2 text-3xl font-black">ARIN QAMAR</h2>
            <div className="mt-2 inline-flex items-center gap-2 border border-cyan-300/18 bg-cyan-300/5 px-3 py-1.5">
              <Sparkles size={12} className="text-cyan-300" />
              <span className="system-font text-[8px] tracking-[0.18em] text-cyan-200">NOVICE HUNTER</span>
            </div>
            <p className="mt-4 max-w-lg text-[11px] leading-relaxed text-[var(--muted)]">Awakened on July 04, 2026. Specialized in intellectual growth and relentless consistency.</p>
          </div>
          <RankEmblem rank={hunter.rank} />
        </div>
      </section>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="system-font text-[8px] tracking-[0.24em] text-blue-400">BADGE CASE</p>
                <h2 className="system-font mt-1 text-sm font-bold">ACHIEVEMENTS</h2>
              </div>
              <span className="system-font text-[8px] text-[var(--muted)]">3 / 18 UNLOCKED</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map(({ title, detail, icon: Icon, unlocked, color }) => (
                <div key={title} className={`relative border p-4 ${unlocked ? "border-blue-300/15 bg-white/[0.018]" : "border-white/5 bg-black/10 opacity-45"}`}>
                  <div className={`mb-4 grid size-10 place-items-center border border-current/20 bg-white/[0.02] ${unlocked ? color : "text-slate-600"}`}>
                    {unlocked ? <Icon size={18} /> : <LockKeyhole size={16} />}
                  </div>
                  <h3 className="text-[11px] font-semibold">{title}</h3>
                  <p className="mt-1.5 text-[9px] leading-relaxed text-[var(--muted)]">{detail}</p>
                  {unlocked && <Check className="absolute right-3 top-3 text-emerald-300" size={12} />}
                </div>
              ))}
            </div>
          </section>
          <section>
            <p className="system-font mb-4 text-[8px] tracking-[0.24em] text-blue-400">ATTRIBUTE MATRIX</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {(Object.keys(hunter.stats) as StatKey[]).map((stat) => <StatCard compact key={stat} stat={stat} value={hunter.stats[stat]} />)}
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="system-panel p-5">
            <div className="flex items-center gap-3">
              <Settings2 className="text-blue-300" size={18} />
              <div>
                <p className="system-font text-[8px] tracking-[0.2em] text-blue-400">SYSTEM SETTINGS</p>
                <h2 className="mt-1 text-sm font-semibold">Hunter preferences</h2>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {[
                ["Time zone", "Asia / Kolkata"],
                ["Daily reset", "12:00 AM"],
                ["Sound effects", sound ? "Enabled" : "Muted"],
                ["Theme", "System dark"],
              ].map(([label, value]) => (
                <button key={label} onClick={label === "Sound effects" ? toggleSound : undefined} className="flex w-full items-center justify-between border border-white/5 bg-white/[0.015] px-3 py-3 text-[10px] transition hover:border-blue-300/20">
                  <span className="text-[var(--muted)]">{label}</span>
                  <span className="font-medium">{value}</span>
                </button>
              ))}
            </div>
          </section>
          <section className="system-panel p-5">
            <p className="system-font text-[8px] tracking-[0.24em] text-amber-300">TITLE INVENTORY</p>
            <div className="mt-4 space-y-2">
              {["Novice Hunter", "The Unbroken", "Early Riser", "Iron Willed"].map((title, index) => (
                <button key={title} className={`flex w-full items-center justify-between border px-3 py-3 text-left text-[10px] ${index === 0 ? "border-cyan-300/25 bg-cyan-300/5 text-cyan-200" : "border-white/5 text-[var(--muted)]"}`}>
                  {title}
                  {index === 0 && <Check size={12} />}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
