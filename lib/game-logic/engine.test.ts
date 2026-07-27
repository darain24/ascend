import { describe, expect, it } from "vitest";
import { applyXp, rankForLevel, xpForLevel } from "./engine";

describe("game engine", () => {
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
