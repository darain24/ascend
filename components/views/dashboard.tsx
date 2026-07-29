"use client";

import { ArrowRight, Flame, Plus, Trophy } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";
import { StatCard } from "../stat-card";
import { QuestCard } from "../quest-card";
import { SectionHeading } from "../section-heading";
import { ActivityHeatmap } from "../activity-heatmap";
import type { StatKey } from "@/lib/game-logic/constants";

export function Dashboard() {
  const hunter = useHunterStore((state) => state.hunter);
  const quests = useHunterStore((state) => state.quests);
  const profile = useHunterStore((state) => state.profile);
  const activity = useHunterStore((state) => state.activity);
  const setView = useHunterStore((state) => state.setView);
  const completed = quests.filter((quest) => quest.completed).length;
  const dayPercent = quests.length ? Math.round((completed / quests.length) * 100) : 0;
  const xpPercent = (hunter.xp / hunter.xpToNext) * 100;

  return (
    <>
      <section className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Welcome, {profile.name || "Hunter"}</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Here&apos;s a simple look at today&apos;s progress.</p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
        <div className="space-y-5">
          <section className="system-panel p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-2xl font-semibold text-indigo-700">
                {hunter.level}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Level {hunter.level} · Rank {hunter.rank}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">Novice Hunter</p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">{hunter.xp.toLocaleString()} XP</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${xpPercent}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-[var(--muted)]">
                  <span>{Math.round(xpPercent)}% complete</span>
                  <span>{(hunter.xpToNext - hunter.xp).toLocaleString()} XP to next level</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionHeading title="Your attributes" eyebrow="A balanced view of the areas you are building" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              {(Object.keys(hunter.stats) as StatKey[]).map((stat) => <StatCard key={stat} stat={stat} value={hunter.stats[stat]} />)}
            </div>
          </section>

          <section className="system-panel p-4 sm:p-5">
            <SectionHeading
              title="Today’s quests"
              eyebrow={`${completed} of ${quests.length} complete`}
              action={<button onClick={() => setView("quests")} className="flex items-center gap-1 text-xs font-medium text-indigo-600">View all <ArrowRight size={13} /></button>}
            />
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${dayPercent}%` }} />
            </div>
            <div className="grid gap-2">
              {quests.slice(0, 4).map((quest) => <QuestCard key={quest.id} quest={quest} />)}
              {quests.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--line)] px-5 py-8 text-center">
                  <p className="text-sm font-medium">No quests yet</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Create your first quest to begin earning XP.</p>
                  <button onClick={() => setView("quests")} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white">
                    <Plus size={13} /> Create a quest
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="system-panel p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--muted)]">Current streak</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight">{hunter.streak} days</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">Best: {hunter.longestStreak} days</p>
              </div>
              <div className="grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-500"><Flame size={19} /></div>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <div key={`${day}-${index}`} className="text-center">
                  <div className="mx-auto mb-1.5 grid size-7 place-items-center rounded-full bg-slate-100 text-[10px] text-slate-400">·</div>
                  <span className="text-[9px] text-[var(--muted)]">{day}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="system-panel p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600"><Plus size={18} /></div>
              <div>
                <p className="text-sm font-semibold">Your journey starts here</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">Complete quests to build your first streak.</p>
              </div>
            </div>
            <button onClick={() => setView("quests")} className="mt-5 w-full rounded-xl border border-[var(--line)] py-2.5 text-xs font-medium text-indigo-600">Go to quests</button>
          </section>

          <section className="system-panel p-5">
            <SectionHeading title="Recent activity" eyebrow="Last 12 weeks" />
            <ActivityHeatmap activity={activity} compact />
          </section>

          <section className="system-panel flex items-center gap-4 p-5">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600"><Trophy size={18} /></div>
            <div>
              <p className="text-sm font-semibold">{hunter.totalCompleted} quests completed</p>
              <p className="mt-0.5 text-[11px] text-[var(--muted)]">{hunter.totalXp.toLocaleString()} lifetime XP</p>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
