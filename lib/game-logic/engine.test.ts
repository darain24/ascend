import { describe, expect, it } from "vitest";
import { applyXp, rankForLevel, xpForLevel } from "./engine";
import { initialHunter, initialQuests } from "../initial-data";
import {
  addQuestCompletion,
  buildActivityDays,
  localDateKey,
} from "../activity";

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

  it("records quest completions on the user's local calendar day", () => {
    const completedAt = new Date(2026, 6, 29, 23, 45);
    const first = addQuestCompletion({}, 60, completedAt);
    const second = addQuestCompletion(first, 35, completedAt);

    expect(first[localDateKey(completedAt)]).toEqual({ completed: 1, xp: 60 });
    expect(second[localDateKey(completedAt)]).toEqual({ completed: 2, xp: 95 });
  });

  it("builds chronological heatmap days with activity intensity", () => {
    const today = new Date(2026, 6, 29, 10);
    const todayKey = localDateKey(today);
    const days = buildActivityDays(
      { [todayKey]: { completed: 4, xp: 230 } },
      7,
      today,
    );

    expect(days).toHaveLength(7);
    expect(days[0].dateKey).toBe("2026-07-23");
    expect(days[6]).toMatchObject({
      dateKey: todayKey,
      completed: 4,
      xp: 230,
      intensity: 4,
    });
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
