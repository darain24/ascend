"use client";

import { motion } from "framer-motion";
import { statColors, statIcons } from "./system-icons";
import type { StatKey } from "@/lib/game-logic/constants";

const names = { STR: "Strength", VIT: "Vitality", INT: "Focus", AGI: "Agility", PER: "Awareness" };

export function StatCard({ stat, value }: { stat: StatKey; value: number; compact?: boolean }) {
  const Icon = statIcons[stat];
  const color = statColors[stat];
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="grid size-8 place-items-center rounded-lg" style={{ color, background: `${color}12` }}>
          <Icon size={15} />
        </div>
        <span className="text-lg font-semibold">{value}</span>
      </div>
      <p className="text-xs font-medium">{names[stat]}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.05]">
        <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(100, value * 2.4)}%` }} transition={{ duration: 0.7 }} style={{ background: color }} />
      </div>
    </div>
  );
}
