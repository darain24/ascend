"use client";

import { motion } from "framer-motion";
import { statColors, statIcons } from "./system-icons";
import type { StatKey } from "@/lib/game-logic/constants";

export function StatCard({ stat, value, compact = false }: { stat: StatKey; value: number; compact?: boolean }) {
  const Icon = statIcons[stat];
  const color = statColors[stat];
  const label = {
    STR: "Strength",
    VIT: "Vitality",
    INT: "Intellect",
    AGI: "Agility",
    PER: "Perception",
  }[stat];

  return (
    <div className={`system-panel ${compact ? "p-4" : "p-4 sm:p-5"}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon size={16} style={{ color }} />
          <div>
            <p className="system-font text-[9px] font-bold tracking-[0.14em]" style={{ color }}>{stat}</p>
            {!compact && <p className="mt-0.5 text-[9px] text-[var(--muted)]">{label}</p>}
          </div>
        </div>
        <span className="system-font text-lg font-black">{value}</span>
      </div>
      <div className="h-1 overflow-hidden bg-white/[0.045]">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value * 2.4)}%` }}
          transition={{ duration: 0.9, delay: 0.15 }}
          style={{ background: `linear-gradient(90deg, ${color}70, ${color})`, boxShadow: `0 0 10px ${color}` }}
        />
      </div>
    </div>
  );
}
