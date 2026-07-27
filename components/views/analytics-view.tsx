"use client";

import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, CheckCircle2, Flame, Trophy } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";
import { heatmapData, xpHistory } from "@/lib/demo-data";
import type { StatKey } from "@/lib/game-logic/constants";

export function AnalyticsView() {
  const hunter = useHunterStore((state) => state.hunter);
  const radar = (Object.keys(hunter.stats) as StatKey[]).map((stat) => ({ stat, value: hunter.stats[stat], max: 40 }));

  return (
    <>
      <div className="mb-7">
        <p className="system-font text-[9px] font-bold tracking-[0.3em] text-blue-400">PERFORMANCE ARCHIVE</p>
        <h1 className="system-font mt-2 text-2xl font-black sm:text-3xl">HUNTER ANALYTICS</h1>
        <p className="mt-2 text-xs text-[var(--muted)]">The System remembers every step of your ascent.</p>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: Flame, label: "Current streak", value: `${hunter.streak} days`, color: "text-amber-300" },
          { icon: Trophy, label: "Longest streak", value: `${hunter.longestStreak} days`, color: "text-purple-300" },
          { icon: CheckCircle2, label: "Quests cleared", value: hunter.totalCompleted, color: "text-emerald-300" },
          { icon: Activity, label: "Lifetime XP", value: hunter.totalXp.toLocaleString(), color: "text-cyan-300" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="system-panel p-4 sm:p-5">
            <Icon className={color} size={17} />
            <p className="system-font mt-4 text-xl font-black">{value}</p>
            <p className="mt-1 text-[9px] text-[var(--muted)]">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <section className="system-panel p-4 sm:p-6">
          <div className="mb-6">
            <p className="system-font text-[8px] tracking-[0.24em] text-blue-400">EXPERIENCE FLOW</p>
            <h2 className="system-font mt-1 text-sm font-bold">XP EARNED THIS WEEK</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpHistory}>
                <defs>
                  <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4da6ff" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#4da6ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(100,160,220,.08)" vertical={false} />
                <XAxis dataKey="day" stroke="#617991" tickLine={false} axisLine={false} fontSize={9} />
                <YAxis stroke="#617991" tickLine={false} axisLine={false} fontSize={9} />
                <Tooltip contentStyle={{ background: "#091322", border: "1px solid rgba(77,166,255,.3)", borderRadius: 0, fontSize: 10 }} />
                <Area type="monotone" dataKey="xp" stroke="#55baff" strokeWidth={2} fill="url(#xpFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="system-panel p-4 sm:p-6">
          <div className="mb-2">
            <p className="system-font text-[8px] tracking-[0.24em] text-purple-300">ATTRIBUTE BALANCE</p>
            <h2 className="system-font mt-1 text-sm font-bold">STAT MATRIX</h2>
          </div>
          <div className="h-[324px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="70%">
                <PolarGrid stroke="rgba(100,160,220,.16)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#8da4bd", fontSize: 9 }} />
                <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="system-panel mt-5 p-4 sm:p-6">
        <div className="mb-5">
          <p className="system-font text-[8px] tracking-[0.24em] text-emerald-300">CONSISTENCY MAP</p>
          <h2 className="system-font mt-1 text-sm font-bold">LAST 84 DAYS</h2>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {heatmapData.map((value, index) => (
            <div key={index} className="aspect-square border border-blue-300/[0.04]" style={{ background: value === 0 ? "rgba(255,255,255,.025)" : `rgba(65, 180, 255, ${0.13 + value * 0.18})` }} />
          ))}
        </div>
      </section>
    </>
  );
}
