import { expect, test, type Page } from "@playwright/test";

const hasDatabaseAccount = Boolean(process.env.E2E_AUTH_EMAIL && process.env.E2E_AUTH_PASSWORD);

async function signIn(page: Page) {
  await page.goto("/signin");
  await page.getByLabel("Email").fill(process.env.E2E_AUTH_EMAIL!);
  await page.getByLabel("Password").fill(process.env.E2E_AUTH_PASSWORD!);
  await Promise.all([
    page.waitForURL("**/"),
    page.getByRole("button", { name: "Sign in" }).click(),
  ]);
}

test("an unauthenticated visitor is redirected to sign in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("password reset does not reveal whether an account exists", async ({ page }) => {
  await page.route("**/api/account/reset-password/request", async (route) => {
    await route.fulfill({ json: { message: "If that account exists, a reset link has been sent." } });
  });
  await page.goto("/reset-password");
  await page.getByLabel("Account email").fill("unknown@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("If that account exists, a reset link has been sent.")).toBeVisible();
});

test("authenticated hunter creates and completes a server-backed quest", async ({ page }) => {
  test.skip(!hasDatabaseAccount, "Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD for database integration tests.");
  await signIn(page);
  await page.getByRole("button", { name: "Quests" }).first().click();
  await page.getByRole("button", { name: "Add quest" }).click();
  const title = `First ascent ${Date.now()}`;
  await page.getByPlaceholder("e.g. Conquer the morning run").fill(title);
  await page.getByLabel("Difficulty").selectOption("ELITE");
  await page.getByRole("button", { name: "Add quest" }).last().click();
  await page.getByRole("button", { name: `Complete ${title}` }).click();
  await expect(page.getByText(/Quest complete|Level \d+/)).toBeVisible();
});

test("AI quest generator reviews and saves a generated chain", async ({ page }) => {
  test.skip(!hasDatabaseAccount, "Set E2E_AUTH_EMAIL and E2E_AUTH_PASSWORD for database integration tests.");
  await page.route("**/api/ai/quests", async (route) => {
    await route.fulfill({
      json: {
        quests: [1, 2, 3].map((index) => ({
          title: `Generated quest ${index} ${Date.now()}`,
          detail: "A measurable step",
          stat: "INT",
          difficulty: "EASY",
          xp: 35,
        })),
      },
    });
  });
  await signIn(page);
  await page.getByRole("button", { name: "System" }).first().click();
  await page.getByPlaceholder(/Describe a goal/).fill("Learn algorithms");
  await page.getByRole("button", { name: "Generate quest chain" }).click();
  await expect(page.locator('input[value^="Generated quest 1"]')).toBeVisible();
  await page.getByRole("button", { name: "Add all quests" }).click();
  await expect(page.getByText("Quest chain added to your list.")).toBeVisible();
});

test("guild raid contribution rejects replay of a quest log", async ({ page }) => {
  test.skip(
    !hasDatabaseAccount || !process.env.E2E_RAID_ID || !process.env.E2E_QUEST_LOG_ID,
    "Requires an authenticated test account and isolated raid fixtures.",
  );
  await signIn(page);
  const first = await page.request.post("/api/raids/contribute", {
    data: { raidBossId: process.env.E2E_RAID_ID, questLogId: process.env.E2E_QUEST_LOG_ID },
  });
  expect(first.ok()).toBeTruthy();
  const replay = await page.request.post("/api/raids/contribute", {
    data: { raidBossId: process.env.E2E_RAID_ID, questLogId: process.env.E2E_QUEST_LOG_ID },
  });
  expect(replay.status()).toBe(409);
});
