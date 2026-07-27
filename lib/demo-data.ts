import type { HunterState, Quest } from "@/types/game";

export const initialHunter: HunterState = {
  level: 12,
  xp: 680,
  xpToNext: 4157,
  rank: "D",
  discipline: 87,
  streak: 14,
  longestStreak: 23,
  totalCompleted: 186,
  totalXp: 12840,
  stats: { STR: 27, VIT: 22, INT: 31, AGI: 24, PER: 19 },
};

export const initialQuests: Quest[] = [
  {
    id: "q-workout",
    title: "Strength Protocol",
    detail: "Complete a 45 minute workout",
    stat: "STR",
    xp: 100,
    type: "DAILY",
    difficulty: "HARD",
    completed: false,
  },
  {
    id: "q-read",
    title: "Scholar's Focus",
    detail: "Read without distraction for 30 min",
    stat: "INT",
    xp: 60,
    type: "DAILY",
    difficulty: "NORMAL",
    completed: true,
  },
  {
    id: "q-sleep",
    title: "Vital Restoration",
    detail: "Sleep before 11:00 PM",
    stat: "VIT",
    xp: 60,
    type: "DAILY",
    difficulty: "NORMAL",
    completed: false,
  },
  {
    id: "q-walk",
    title: "Silent Steps",
    detail: "Walk 8,000 steps",
    stat: "AGI",
    xp: 35,
    type: "DAILY",
    difficulty: "EASY",
    completed: false,
  },
  {
    id: "q-journal",
    title: "Hunter's Log",
    detail: "Reflect and plan tomorrow",
    stat: "PER",
    xp: 35,
    type: "DAILY",
    difficulty: "EASY",
    completed: false,
  },
];

export const heatmapData = Array.from({ length: 84 }, (_, index) => {
  const deterministic = (index * 17 + 11) % 10;
  return index > 78 ? (index % 3) + 1 : deterministic < 2 ? 0 : deterministic < 5 ? 1 : deterministic < 8 ? 2 : 3;
});

export const xpHistory = [
  { day: "Mon", xp: 320 },
  { day: "Tue", xp: 470 },
  { day: "Wed", xp: 410 },
  { day: "Thu", xp: 690 },
  { day: "Fri", xp: 760 },
  { day: "Sat", xp: 980 },
  { day: "Sun", xp: 1140 },
];
