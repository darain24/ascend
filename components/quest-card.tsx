"use client";

import { useMutation } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useHunterStore } from "@/store/use-hunter-store";
import { statColors, statIcons } from "./system-icons";
import type { Quest, HunterState } from "@/types/game";

type CompletionResponse = { hunter: HunterState; leveledUp: boolean; rankedUp: boolean; xpAwarded: number };

export function QuestCard({ quest, expanded = false }: { quest: Quest; expanded?: boolean }) {
  const applyCompletion = useHunterStore((state) => state.applyCompletion);
  const setOverlay = useHunterStore((state) => state.setOverlay);
  const Icon = statIcons[quest.stat];
  const color = statColors[quest.stat];

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ questId: quest.id }),
      });
      if (!response.ok) throw new Error("Could not complete this quest.");
      return (await response.json()) as CompletionResponse;
    },
    onSuccess: (data) => {
      applyCompletion(quest.id, data.hunter);
      setOverlay({
        kind: data.rankedUp ? "rank" : data.leveledUp ? "level" : "quest",
        title: data.rankedUp ? `You reached rank ${data.hunter.rank}` : data.leveledUp ? `Level ${data.hunter.level}` : "Quest complete",
        subtitle: `You earned ${data.xpAwarded} XP and improved ${quest.stat}.`,
      });
      void fetch("/api/ai/narrate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          context: `${quest.title} completed. ${data.xpAwarded} XP awarded to ${quest.stat}. Level ${data.hunter.level}, Rank ${data.hunter.rank}.`,
        }),
      })
        .then((response) => response.json() as Promise<{ message?: string | null }>)
        .then(({ message }) => {
          if (!message || !useHunterStore.getState().overlay) return;
          useHunterStore.getState().setOverlay({
            ...useHunterStore.getState().overlay!,
            subtitle: message,
          });
        })
        .catch(() => undefined);
    },
  });

  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-3.5 transition ${quest.completed ? "border-emerald-100 bg-emerald-50/60 opacity-70" : "border-[var(--line)] bg-[var(--panel)] hover:border-indigo-200"}`}>
      <div className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ color, background: `${color}12` }}><Icon size={16} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`truncate text-[13px] font-medium ${quest.completed ? "line-through" : ""}`}>{quest.title}</h3>
          {expanded && <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[9px] text-[var(--muted)]">{quest.difficulty.toLowerCase()}</span>}
        </div>
        <p className="mt-1 truncate text-[11px] text-[var(--muted)]">{quest.detail}</p>
      </div>
      <span className="hidden text-[11px] font-medium text-indigo-600 sm:block">+{quest.xp} XP</span>
      <button aria-label={quest.completed ? "Completed" : `Complete ${quest.title}`} disabled={quest.completed || mutation.isPending} onClick={() => mutation.mutate()} className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${quest.completed ? "border-emerald-200 bg-emerald-100 text-emerald-700" : "border-[var(--line)] text-slate-400 hover:border-indigo-300 hover:text-indigo-600"}`}>
        {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
      </button>
    </div>
  );
}
