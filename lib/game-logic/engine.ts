import { RANK_BRACKETS } from "./constants";

export type Rank = "E" | "D" | "C" | "B" | "A" | "S";

export function xpForLevel(level: number) {
  return Math.round(100 * Math.pow(Math.max(1, level), 1.5));
}

export function rankForLevel(level: number): Rank {
  return [...RANK_BRACKETS]
    .reverse()
    .find((bracket) => level >= bracket.min)!.rank;
}

export function applyXp(
  level: number,
  currentXp: number,
  gainedXp: number,
) {
  let nextLevel = level;
  let xp = currentXp + Math.max(0, gainedXp);
  let leveledUp = false;

  while (xp >= xpForLevel(nextLevel)) {
    xp -= xpForLevel(nextLevel);
    nextLevel += 1;
    leveledUp = true;
  }

  const previousRank = rankForLevel(level);
  const rank = rankForLevel(nextLevel);
  return {
    level: nextLevel,
    currentXp: xp,
    xpToNextLevel: xpForLevel(nextLevel),
    rank,
    leveledUp,
    rankedUp: previousRank !== rank,
  };
}
