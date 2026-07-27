export const RANK_BRACKETS = [
  { rank: "E", min: 1, color: "#8ca0b5" },
  { rank: "D", min: 11, color: "#45efae" },
  { rank: "C", min: 26, color: "#4da6ff" },
  { rank: "B", min: 46, color: "#a875ff" },
  { rank: "A", min: 71, color: "#ff9f43" },
  { rank: "S", min: 101, color: "#ffd45c" },
] as const;

export const DIFFICULTY_XP = {
  EASY: 35,
  NORMAL: 60,
  HARD: 100,
  ELITE: 180,
} as const;

export const STAT_KEYS = ["STR", "VIT", "INT", "AGI", "PER"] as const;
export type StatKey = (typeof STAT_KEYS)[number];
