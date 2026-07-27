"use client";

import { motion } from "framer-motion";
import { Activity, ArrowRight, CalendarDays, Flame, ShieldAlert, Swords, Target, Trophy } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";
import { RankEmblem } from "../rank-emblem";
import { StatCard } from "../stat-card";
import { QuestCard } from "../quest-card";
import { SectionHeading } from "../section-heading";
import { heatmapData } from "@/lib/demo-data";
import type { StatKey } from "@/lib/game-logic/constants";

export function Dashboard() {
  const hunter = useHunterStore((state) => state.hunter);
  const quests = useHunterStore((state) => state.quests);
  const setView = useHunterStore((state) => state.setView);
  const completed = quests.filter((quest) => quest.completed).length;
  const xpPercent = (hunter.xp / hunter.xpToNext) * 100;

  return (
    <>
      <section className="mb-6">
        <p className="system-font text-[9px] font-bold tracking-[0.32em] text-blue-400">WELCOME BACK, HUNTER</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="system-font text-2xl font-black tracking-wide sm:text-3xl">
              Your ascent <span className="text-cyan-300 glow-text">continues.</span>
            </h1>
            <p className="mt-2 text-xs text-[var(--muted)]">Four quests stand between you and a perfect day.</p>
          </div>
          <div className="system-font flex items-center gap-2 text-[9px] tracking-[0.15em] text-[var(--muted)]">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            SYSTEM STATUS: NOMINAL
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.42fr_.72fr]">
        <div className="space-y-5">
          <section className="system-panel overflow-hidden p-5 sm:p-7">
            <div className="absolute right-0 top-0 h-full w-2/5 bg-[radial-gradient(circle_at_75%_32%,rgba(56,189,248,.12),transparent_62%)]" />
            <div className="relative flex flex-col items-center gap-7 sm:flex-row">
              <RankEmblem rank={hunter.rank} />
              <div className="w-full flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="system-font text-[8px] tracking-[0.28em] text-[var(--muted)]">CURRENT CLASS</p>
                    <h2 className="system-font mt-1 text-2xl font-black tracking-wide">SHADOW INITIATE</h2>
                    <p className="mt-1 text-xs text-blue-300">“The one who moves before dawn.”</p>
                  </div>
                  <div className="text-right">
                    <p className="system-font text-[8px] tracking-widest text-[var(--muted)]">LEVEL</p>
                    <p className="system-font text-4xl font-black text-white">{hunter.level}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between system-font text-[8px] tracking-wider">
                    <span className="text-blue-300">EXPERIENCE</span>
                    <span className="text-[var(--muted)]">{hunter.xp.toLocaleString()} / {hunter.xpToNext.toLocaleString()} XP</span>
                  </div>
                  <div className="h-2 overflow-hidden border border-blue-300/10 bg-black/25 p-px">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 shadow-[0_0_14px_rgba(56,189,248,.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="mt-2 text-right text-[9px] text-[var(--muted)]">{(hunter.xpToNext - hunter.xp).toLocaleString()} XP until Level {hunter.level + 1}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading
              eyebrow="ATTRIBUTE MATRIX"
              title="HUNTER STATS"
              action={<span className="system-font text-[8px] tracking-wider text-[var(--muted)]">+3 POINTS THIS WEEK</span>}
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {(Object.keys(hunter.stats) as StatKey[]).map((stat) => (
                <StatCard key={stat} stat={stat} value={hunter.stats[stat]} />
              ))}
            </div>
          </section>

          <section className="system-panel p-5">
            <SectionHeading
              eyebrow="DAILY PROTOCOL"
              title="ACTIVE QUESTS"
              action={
                <button onClick={() => setView("quests")} className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-300 transition hover:text-cyan-200">
                  View all <ArrowRight size={13} />
                </button>
              }
            />
            <div className="mb-4 flex items-center gap-3 border border-blue-300/10 bg-blue-400/[0.025] px-4 py-3">
              <div className="grid size-8 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/5 text-cyan-300">
                <Target size={15} />
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex justify-between text-[10px]">
                  <span>{completed} of {quests.length} completed</span>
                  <span className="text-cyan-300">{Math.round((completed / quests.length) * 100)}%</span>
                </div>
                <div className="h-1 bg-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${(completed / quests.length) * 100}%` }} />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              {quests.slice(0, 4).map((quest) => <QuestCard key={quest.id} quest={quest} />)}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="system-panel overflow-hidden p-5">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/8 blur-3xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="system-font text-[8px] tracking-[0.25em] text-amber-300/75">CURRENT STREAK</p>
                <p className="system-font mt-2 text-4xl font-black">{hunter.streak}<span className="ml-2 text-xs text-[var(--muted)]">DAYS</span></p>
                <p className="mt-1 text-[10px] text-[var(--muted)]">Personal best: {hunter.longestStreak} days</p>
              </div>
              <Flame className="text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,.6)]" size={34} />
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1.5">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  <div className={`mx-auto mb-2 grid size-7 place-items-center border text-[9px] ${index < 6 ? "border-amber-300/25 bg-amber-300/10 text-amber-200" : "border-blue-300/12 text-slate-600"}`}>
                    {index < 6 ? "✓" : "·"}
                  </div>
                  <span className="system-font text-[7px] text-[var(--muted)]">{day}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="system-panel p-5">
            <SectionHeading eyebrow="WEEKLY CHALLENGE" title="DUNGEON BREAK" />
            <div className="border border-purple-400/20 bg-purple-400/[0.035] p-4">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center border border-purple-400/30 bg-purple-400/10 text-purple-300">
                    <Swords size={19} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">The Iron Path</p>
                    <p className="mt-1 text-[9px] text-[var(--muted)]">Run 20km before Sunday</p>
                  </div>
                </div>
                <span className="system-font text-[8px] font-bold text-purple-300">ELITE</span>
              </div>
              <div className="mb-2 flex justify-between system-font text-[8px]">
                <span className="text-[var(--muted)]">12.4 / 20 KM</span>
                <span className="text-purple-300">62%</span>
              </div>
              <div className="h-1.5 bg-black/30">
                <div className="h-full w-[62%] bg-gradient-to-r from-purple-600 to-fuchsia-300 shadow-[0_0_10px_rgba(192,132,252,.5)]" />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[9px] text-[var(--muted)]">
                <span>Reward</span>
                <span className="system-font text-purple-200">+600 XP · RARE TITLE</span>
              </div>
            </div>
          </section>

          <section className="system-panel p-5">
            <SectionHeading eyebrow="CONSISTENCY RECORD" title="84-DAY ACTIVITY" />
            <div className="grid grid-flow-col grid-rows-7 gap-1">
              {heatmapData.map((value, index) => (
                <div
                  key={index}
                  title={`${value} quests completed`}
                  className="aspect-square min-h-2 border border-blue-300/[0.04]"
                  style={{ background: value === 0 ? "rgba(255,255,255,.025)" : `rgba(65, 180, 255, ${0.13 + value * 0.18})` }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-[8px] text-[var(--muted)]">
              <span>12 weeks ago</span>
              <span className="flex items-center gap-1">Less <i className="size-2 bg-blue-400/20" /><i className="size-2 bg-blue-400/45" /><i className="size-2 bg-cyan-300/80" /> More</span>
            </div>
          </section>

          <section className={`system-panel p-5 ${hunter.discipline < 50 ? "border-rose-400/30 bg-rose-500/[0.04]" : ""}`}>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center border border-blue-300/15 text-blue-300">
                <ShieldAlert size={18} />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="system-font text-[9px] font-bold tracking-wider">DISCIPLINE</p>
                  <span className="system-font text-[9px] text-cyan-300">{hunter.discipline}%</span>
                </div>
                <div className="h-1 bg-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${hunter.discipline}%` }} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[9px] leading-relaxed text-[var(--muted)]">
              Your discipline is stable. Complete today&apos;s protocol to reinforce it.
            </p>
          </section>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Trophy, label: "Quests", value: hunter.totalCompleted },
              { icon: Activity, label: "Total XP", value: "12.8k" },
              { icon: CalendarDays, label: "Perfect", value: 32 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="system-panel p-3 text-center">
                <Icon className="mx-auto mb-2 text-blue-300" size={15} />
                <p className="system-font text-sm font-bold">{value}</p>
                <p className="mt-1 text-[8px] text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
