import { expect, test } from "@playwright/test";

test("sign up, complete the first elite quest, and level up", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Name").fill("New Hunter");
  await page.getByLabel("Email").fill(`hunter-${Date.now()}@example.com`);
  await page.locator('input[type="password"]').nth(0).fill("Ascend123");
  await page.locator('input[type="password"]').nth(1).fill("Ascend123");
  await Promise.all([
    page.waitForURL("**/"),
    page.getByRole("button", { name: "Create account" }).click(),
  ]);
  await page.getByRole("button", { name: "Quests" }).first().click();
  await page.getByRole("button", { name: "Add quest" }).click();
  await page.getByPlaceholder("e.g. Conquer the morning run").fill("First ascent");
  await page.getByLabel("Difficulty").selectOption("ELITE");
  await page.getByRole("button", { name: "Add quest" }).last().click();
  await page.getByRole("button", { name: "Complete First ascent" }).click();
  await expect(page.getByRole("heading", { name: "Level 2" })).toBeVisible();
});

test("AI quest generator reviews and saves a generated chain", async ({ page }) => {
  await page.route("**/api/ai/quests", async (route) => {
    await route.fulfill({
      json: {
        quests: [1, 2, 3].map((index) => ({
          title: `Generated quest ${index}`,
          detail: "A measurable step",
          stat: "INT",
          difficulty: "EASY",
          xp: 35,
        })),
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "System" }).first().click();
  await page.getByPlaceholder(/Describe a goal/).fill("Learn algorithms");
  await page.getByRole("button", { name: "Generate quest chain" }).click();
  await expect(page.locator('input[value="Generated quest 1"]')).toBeVisible();
  await page.getByRole("button", { name: "Add all quests" }).click();
  await expect(page.getByText("Quest chain added to your list.")).toBeVisible();
});

test("guild raid contribution decreases boss HP", async ({ request }) => {
  test.skip(!process.env.E2E_DATABASE_USER_ID || !process.env.E2E_RAID_ID || !process.env.E2E_QUEST_LOG_ID, "Requires seeded integration database IDs.");
  const response = await request.post("/api/raids/contribute", {
    headers: { "x-ascend-user-id": process.env.E2E_DATABASE_USER_ID! },
    data: { raidBossId: process.env.E2E_RAID_ID, questLogId: process.env.E2E_QUEST_LOG_ID },
  });
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  expect(result.damage).toBeGreaterThan(0);
  expect(result.raid.currentHp).toBeLessThan(result.raid.maxHp);
});
