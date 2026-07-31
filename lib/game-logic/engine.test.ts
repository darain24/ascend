import { describe, expect, it } from "vitest";
import { applyXp, rankForLevel, xpForLevel } from "./engine";
import { initialHunter, initialQuests } from "../initial-data";
import {
  addQuestCompletion,
  buildActivityDays,
  localDateKey,
} from "../activity";
import {
  calculateXpAward,
  canUnlockSkill,
  raidDamageFromXp,
  rebirthState,
} from "./advanced";
import { correlationInsight, estimateDaysToTarget } from "../analytics/insights";
import { cosineSimilarity, localEmbedding } from "../ai/embeddings";
import { verifyGitHubSignature } from "../security/webhook";
import { validatePassword } from "../security/password";
import { createHmac } from "crypto";

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

  it("applies class, skill, and rebirth XP multipliers", () => {
    expect(calculateXpAward({
      baseXp: 100,
      stat: "AGI",
      hunterClass: "ASSASSIN",
      globalMultiplier: 1.1,
      skillMultiplier: 1.1,
    })).toBe(139);
  });

  it("enforces skill prerequisites and point costs", () => {
    expect(canUnlockSkill({ cost: 2, availablePoints: 2, prerequisiteSkillId: "root", unlockedSkillIds: ["root"] })).toBe(true);
    expect(canUnlockSkill({ cost: 2, availablePoints: 1, prerequisiteSkillId: "root", unlockedSkillIds: ["root"] })).toBe(false);
  });

  it("handles raid damage and valid S-rank rebirth", () => {
    expect(raidDamageFromXp(60, 1.5)).toBe(90);
    expect(rebirthState({ rank: "S", rebirthCount: 1, globalXpMultiplier: 1.05 })).toMatchObject({
      level: 1,
      rank: "E",
      rebirthCount: 2,
      globalXpMultiplier: 1.1,
    });
  });

  it("estimates rank ETA from weighted recent XP pace", () => {
    expect(estimateDaysToTarget([0, 50, 100], 100, 500)).toBe(6);
    expect(estimateDaysToTarget([0, 0], 0, 100)).toBeNull();
  });

  it("calculates transparent co-occurrence correlations", () => {
    const insight = correlationInsight([
      { date: "1", stats: ["INT", "VIT"] },
      { date: "2", stats: ["INT", "VIT"] },
      { date: "3", stats: ["INT"] },
      { date: "4", stats: [] },
    ], "INT", "VIT");
    expect(insight.withRate).toBe(1);
    expect(insight.withoutRate).toBe(0.5);
    expect(insight.liftPercent).toBe(100);
  });

  it("retrieves semantically overlapping local journal vectors", () => {
    const related = cosineSimilarity(localEmbedding("morning run felt strong"), localEmbedding("run workout"));
    const unrelated = cosineSimilarity(localEmbedding("morning run felt strong"), localEmbedding("binary search trees"));
    expect(related).toBeGreaterThan(unrelated);
  });

  it("verifies GitHub webhook signatures with timing-safe comparison", () => {
    const body = JSON.stringify({ ref: "refs/heads/main" });
    const secret = "test-secret";
    const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    expect(verifyGitHubSignature(body, signature, secret)).toBe(true);
    expect(verifyGitHubSignature(body, "sha256=bad", secret)).toBe(false);
  });

  it("enforces the production password policy", () => {
    expect(validatePassword("short")).toBeTruthy();
    expect(validatePassword("onlyletters")).toBeTruthy();
    expect(validatePassword("12345678")).toBeTruthy();
    expect(validatePassword("Ascend123")).toBeNull();
  });
});
