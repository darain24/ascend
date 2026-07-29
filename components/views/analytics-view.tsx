"use client";

import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";
import { ActivityHeatmap } from "../activity-heatmap";
import { buildActivityDays } from "@/lib/activity";
import type { StatKey } from "@/lib/game-logic/constants";

export function AnalyticsView() {
  const hunter = useHunterStore((state) => state.hunter);
  const activity = useHunterStore((state) => state.activity);
  const radar = (Object.keys(hunter.stats) as StatKey[]).map((stat) => ({ stat, value: hunter.stats[stat] }));
  const xpHistory = buildActivityDays(activity, 7).map((day) => ({
    day: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(day.date),
    xp: day.xp,
  }));
  const summaries = [
    { icon: Flame, label: "Current streak", value: `${hunter.streak} days`, color: "bg-orange-50 text-orange-500" },
    { icon: Trophy, label: "Personal best", value: `${hunter.longestStreak} days`, color: "bg-violet-50 text-violet-600" },
    { icon: CheckCircle2, label: "Quests complete", value: hunter.totalCompleted, color: "bg-emerald-50 text-emerald-600" },
    { icon: Sparkles, label: "Total experience", value: hunter.totalXp.toLocaleString(), color: "bg-indigo-50 text-indigo-600" },
  ];

  return (
    <>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Progress</h1>
        <p className="mt-1.5 text-sm text-[var(--muted)]">A simple view of how your habits are growing.</p>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaries.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="system-panel p-4 sm:p-5">
            <div className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={16} /></div>
            <p className="mt-4 text-xl font-semibold tracking-tight">{value}</p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <section className="system-panel p-4 sm:p-6">
          <h2 className="text-sm font-semibold">Experience this week</h2>
          <p className="mt-1 text-[11px] text-[var(--muted)]">Daily XP earned from completed quests</p>
          <div className="mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpHistory}>
                <defs><linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.22} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#eceeeb" vertical={false} />
                <XAxis dataKey="day" stroke="#9aa39d" tickLine={false} axisLine={false} fontSize={10} />
                <YAxis stroke="#9aa39d" tickLine={false} axisLine={false} fontSize={10} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e4e7e3", borderRadius: 12, fontSize: 11 }} />
                <Area type="monotone" dataKey="xp" stroke="#6366f1" strokeWidth={2} fill="url(#xpFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="system-panel p-4 sm:p-6">
          <h2 className="text-sm font-semibold">Attribute balance</h2>
          <p className="mt-1 text-[11px] text-[var(--muted)]">Where your recent effort is going</p>
          <div className="h-[302px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="68%">
                <PolarGrid stroke="#e4e7e3" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#748078", fontSize: 10 }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.14} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="system-panel mt-5 p-4 sm:p-6">
        <h2 className="text-sm font-semibold">Consistency</h2>
        <p className="mt-1 text-[11px] text-[var(--muted)]">Activity over the last 84 days</p>
        <div className="mt-5"><ActivityHeatmap activity={activity} /></div>
      </section>
    </>
  );
}
