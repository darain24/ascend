import type { Rank } from "./engine";
import type { StatKey } from "./constants";

export type HunterClass = "ASSASSIN" | "MAGE" | "TANK";

const CLASS_BONUS: Record<HunterClass, StatKey> = {
  ASSASSIN: "AGI",
  MAGE: "INT",
  TANK: "VIT",
};

export function calculateXpAward(input: {
  baseXp: number;
  stat: StatKey;
  hunterClass?: HunterClass | null;
  globalMultiplier?: number;
  skillMultiplier?: number;
}) {
  const classMultiplier =
    input.hunterClass && CLASS_BONUS[input.hunterClass] === input.stat ? 1.15 : 1;
  const globalMultiplier = Math.max(1, input.globalMultiplier ?? 1);
  const skillMultiplier = Math.max(1, input.skillMultiplier ?? 1);
  return Math.round(Math.max(0, input.baseXp) * classMultiplier * globalMultiplier * skillMultiplier);
}

export function canUnlockSkill(input: {
  cost: number;
  availablePoints: number;
  prerequisiteSkillId?: string | null;
  unlockedSkillIds: string[];
}) {
  if (input.cost < 0 || input.availablePoints < input.cost) return false;
  return !input.prerequisiteSkillId || input.unlockedSkillIds.includes(input.prerequisiteSkillId);
}

export function raidDamageFromXp(xp: number, multiplier = 1) {
  return Math.max(0, Math.round(xp * Math.max(0, multiplier)));
}

export function rebirthState(input: {
  rank: Rank;
  rebirthCount: number;
  globalXpMultiplier: number;
}) {
  if (input.rank !== "S") throw new Error("S rank is required for rebirth.");
  const rebirthCount = input.rebirthCount + 1;
  return {
    level: 1,
    currentXp: 0,
    xpToNextLevel: 100,
    rank: "E" as const,
    rebirthCount,
    globalXpMultiplier: Number((Math.max(1, input.globalXpMultiplier) + 0.05).toFixed(2)),
  };
}
