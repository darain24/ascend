"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";
import { statColors, statIcons } from "./system-icons";
import type { Quest, HunterState } from "@/types/game";

type CompletionResponse = {
  hunter: HunterState;
  leveledUp: boolean;
  rankedUp: boolean;
  xpAwarded: number;
};

function playTone(kind: "complete" | "level") {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(kind === "level" ? 520 : 380, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "level" ? 1040 : 620, context.currentTime + 0.18);
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.31);
  } catch {
    // Audio is an enhancement and may be blocked by the browser.
  }
}

export function QuestCard({ quest, expanded = false }: { quest: Quest; expanded?: boolean }) {
  const hunter = useHunterStore((state) => state.hunter);
  const sound = useHunterStore((state) => state.sound);
  const applyCompletion = useHunterStore((state) => state.applyCompletion);
  const setOverlay = useHunterStore((state) => state.setOverlay);
  const Icon = statIcons[quest.stat];
  const color = statColors[quest.stat];

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questId: quest.id, snapshot: hunter }),
      });
      if (!response.ok) throw new Error("The System could not verify this quest.");
      return (await response.json()) as CompletionResponse;
    },
    onSuccess: (data) => {
      applyCompletion(quest.id, data.hunter);
      if (sound) playTone(data.leveledUp ? "level" : "complete");
      setOverlay({
        kind: data.rankedUp ? "rank" : data.leveledUp ? "level" : "quest",
        title: data.rankedUp ? "Rank Advanced" : data.leveledUp ? `Level ${data.hunter.level}` : "Quest Complete",
        subtitle: data.rankedUp
          ? `Your authority has risen to Rank ${data.hunter.rank}.`
          : `+${data.xpAwarded} XP · ${quest.stat} increased`,
      });
    },
  });

  return (
    <motion.div
      layout
      className={`group relative flex items-center gap-3 border p-3.5 transition sm:gap-4 sm:p-4 ${
        quest.completed
          ? "border-emerald-400/15 bg-emerald-400/[0.035] opacity-65"
          : "border-blue-300/14 bg-white/[0.018] hover:border-blue-300/35 hover:bg-blue-500/[0.035]"
      }`}
    >
      <div
        className="grid size-10 shrink-0 place-items-center border"
        style={{ borderColor: `${color}3d`, background: `${color}0c`, color }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`truncate text-[13px] font-semibold ${quest.completed ? "line-through" : ""}`}>{quest.title}</h3>
          {expanded && (
            <span className="hidden border border-white/8 px-2 py-0.5 system-font text-[7px] tracking-wider text-[var(--muted)] sm:inline">
              {quest.difficulty}
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-[10px] text-[var(--muted)]">{quest.detail}</p>
        {quest.goal && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden bg-white/5">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${((quest.progress ?? 0) / quest.goal) * 100}%` }} />
            </div>
            <span className="system-font text-[8px] text-blue-300">{quest.progress}/{quest.goal}</span>
          </div>
        )}
      </div>
      <div className="hidden text-right sm:block">
        <p className="system-font text-[9px] font-bold text-cyan-300">+{quest.xp} XP</p>
        <p className="mt-1 system-font text-[7px] tracking-wider" style={{ color }}>{quest.stat}</p>
      </div>
      <button
        aria-label={quest.completed ? `${quest.title} completed` : `Complete ${quest.title}`}
        disabled={quest.completed || mutation.isPending}
        onClick={() => mutation.mutate()}
        className={`grid size-9 shrink-0 place-items-center border transition ${
          quest.completed
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-blue-300/20 text-slate-600 hover:border-cyan-300/60 hover:bg-cyan-400/10 hover:text-cyan-200"
        }`}
      >
        {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
      </button>
    </motion.div>
  );
}
