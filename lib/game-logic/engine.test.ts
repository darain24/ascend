import { describe, expect, it } from "vitest";
import { applyXp, rankForLevel, xpForLevel } from "./engine";
import { initialHunter, initialQuests } from "../initial-data";

describe("game engine", () => {
  it("starts every new journey with no progress or quests", () => {
    expect(initialHunter).toMatchObject({
      level: 1,
      xp: 0,
      rank: "E",
      streak: 0,
      totalCompleted: 0,
      totalXp: 0,
      stats: { STR: 0, VIT: 0, INT: 0, AGI: 0, PER: 0 },
    });
    expect(initialQuests).toEqual([]);
  });

  it("uses a predictable progressive XP curve", () => {
    expect(xpForLevel(1)).toBe(100);
    expect(xpForLevel(10)).toBe(3162);
  });

  it("maps configured rank boundaries", () => {
    expect(rankForLevel(1)).toBe("E");
    expect(rankForLevel(26)).toBe("C");
    expect(rankForLevel(101)).toBe("S");
  });

  it("supports multiple level gains without losing XP", () => {
    expect(applyXp(1, 80, 200)).toMatchObject({
      level: 2,
      currentXp: 180,
      leveledUp: true,
    });
  });
});
