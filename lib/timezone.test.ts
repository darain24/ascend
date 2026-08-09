import { describe, expect, it } from "vitest";
import { endOfZonedDay, startOfZonedDay, zonedDateKey } from "./timezone";

describe("timezone boundaries", () => {
  it("keeps Asia/Kolkata activity on the user's calendar day", () => {
    const instant = new Date("2026-08-08T19:15:00.000Z");
    expect(zonedDateKey(instant, "Asia/Kolkata")).toBe("2026-08-09");
    expect(startOfZonedDay(instant, "Asia/Kolkata").toISOString()).toBe("2026-08-08T18:30:00.000Z");
  });

  it("handles a daylight-saving transition without using a fixed offset", () => {
    const instant = new Date("2026-03-08T18:00:00.000Z");
    expect(startOfZonedDay(instant, "America/New_York").toISOString()).toBe("2026-03-08T05:00:00.000Z");
    expect(endOfZonedDay(instant, "America/New_York").toISOString()).toBe("2026-03-09T03:59:59.999Z");
  });
});
