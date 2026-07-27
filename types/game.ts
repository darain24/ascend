import type { StatKey } from "@/lib/game-logic/constants";

export type Quest = {
  id: string;
  title: string;
  detail: string;
  stat: StatKey;
  xp: number;
  type: "DAILY" | "CUSTOM" | "DUNGEON";
  difficulty: "EASY" | "NORMAL" | "HARD" | "ELITE";
  completed: boolean;
  progress?: number;
  goal?: number;
};

export type HunterState = {
  level: number;
  xp: number;
  xpToNext: number;
  rank: "E" | "D" | "C" | "B" | "A" | "S";
  discipline: number;
  streak: number;
  longestStreak: number;
  totalCompleted: number;
  totalXp: number;
  stats: Record<StatKey, number>;
};
