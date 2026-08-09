import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

test.afterAll(async () => {
  await db.$disconnect();
});

test("an unauthenticated visitor is redirected to sign in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("public account and policy surfaces are available and protected from cross-site writes", async ({ page }) => {
  for (const path of ["/signup", "/reset-password", "/verify-email", "/privacy", "/terms"]) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
  }
  const health = await page.request.get("/api/health");
  expect(health.status()).toBe(200);
  expect((await health.json()).status).toBe("ok");
  const headers = await page.request.get("/signin");
  expect(headers.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(headers.headers()["strict-transport-security"]).toContain("max-age=31536000");
  const response = await page.request.post("/api/account/signup", {
    headers: { origin: "https://attacker.example", "sec-fetch-site": "cross-site" },
    data: { name: "Blocked", email: "blocked@example.com", password: "Blocked123" },
  });
  expect(response.status()).toBe(403);
});

test("a new hunter completes the production account, quest, AI, guild, and raid lifecycle", async ({ page }) => {
  test.setTimeout(90_000);
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `e2e-${stamp}@example.test`;
  const password = "AscendTest123";
  let userId = "";

  try {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E Hunter");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").first().fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/");

    const session = await (await page.request.get("/api/auth/session")).json() as { user?: { id?: string } };
    userId = session.user?.id ?? "";
    expect(userId).not.toBe("");
    const initial = await (await page.request.get("/api/me")).json() as { hunter: { totalCompleted: number }; quests: unknown[] };
    expect(initial.hunter.totalCompleted).toBe(0);
    expect(initial.quests).toHaveLength(0);

    const guildResponse = await page.request.post("/api/guilds", { data: { name: `E2E Guild ${stamp}`, icon: "shield" } });
    expect(guildResponse.ok()).toBeTruthy();
    const guild = (await guildResponse.json()) as { guild: { id: string } };
    const raid = await db.raidBoss.create({
      data: {
        guildId: guild.guild.id,
        name: "E2E Gatekeeper",
        maxHp: 2_000,
        currentHp: 2_000,
        startsAt: new Date(Date.now() - 60_000),
        endsAt: new Date(Date.now() + 60 * 60 * 1_000),
      },
    });

    await page.getByRole("button", { name: "Quests" }).first().click();
    await page.getByRole("button", { name: "Add quest" }).click();
    const title = `First ascent ${stamp}`;
    await page.getByPlaceholder("e.g. Conquer the morning run").fill(title);
    await page.getByLabel("Difficulty").selectOption("ELITE");
    await page.getByRole("button", { name: "Add quest" }).last().click();
    await page.getByRole("button", { name: `Complete ${title}` }).click();
    await expect(page.getByText(/Quest complete|Level \d+/)).toBeVisible({ timeout: 20_000 });
    await page.getByRole("button", { name: "Continue" }).click();

    const questLog = await db.questLog.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } });
    expect(questLog).not.toBeNull();
    const replay = await page.request.post("/api/raids/contribute", { data: { raidBossId: raid.id, questLogId: questLog!.id } });
    expect(replay.status()).toBe(409);

    await page.route("**/api/ai/quests", async (route) => {
      await route.fulfill({
        json: {
          quests: [1, 2, 3].map((index) => ({
            title: `Generated quest ${index} ${stamp}`,
            detail: "A measurable step",
            stat: "INT",
            difficulty: "EASY",
            xp: 35,
          })),
        },
      });
    });
    await page.getByRole("button", { name: "System" }).first().click();
    await page.getByPlaceholder(/Describe a goal/).fill("Learn algorithms");
    await page.getByRole("button", { name: "Generate quest chain" }).click();
    await expect(page.locator('input[value^="Generated quest 1"]')).toBeVisible();
    await page.getByRole("button", { name: "Add all quests" }).click();
    await expect(page.getByText("Quest chain added to your list.")).toBeVisible();

    const deletion = await page.request.delete("/api/account", { data: { password, confirmation: "DELETE" } });
    expect(deletion.ok()).toBeTruthy();
    userId = "";
    expect(await db.user.findUnique({ where: { email } })).toBeNull();
  } finally {
    if (userId) await db.user.delete({ where: { id: userId } }).catch(() => undefined);
    else await db.user.delete({ where: { email } }).catch(() => undefined);
  }
});
