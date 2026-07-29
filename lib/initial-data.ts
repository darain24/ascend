import type { HunterState, Quest } from "@/types/game";

export const initialHunter: HunterState = {
  level: 1,
  xp: 0,
  xpToNext: 100,
  rank: "E",
  discipline: 0,
  streak: 0,
  longestStreak: 0,
  totalCompleted: 0,
  totalXp: 0,
  stats: { STR: 0, VIT: 0, INT: 0, AGI: 0, PER: 0 },
};

export const initialQuests: Quest[] = [];

export const emptyActivity = Array<number>(84).fill(0);
