import { db } from "@/lib/db";
import { previousZonedDayStart, startOfZonedDay, zonedDateKey, zonedDateParts } from "@/lib/timezone";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();
  const jobName = `daily-reset:${now.toISOString().slice(0, 13)}`;
  const completedRun = await db.jobRun.findFirst({ where: { job: jobName, status: "complete" } });
  if (completedRun) return Response.json({ ok: true, alreadyProcessed: true });
  const run = await db.jobRun.create({ data: { job: jobName, status: "running" } });
  try {
    const recentFloor = new Date(now.getTime() - 48 * 60 * 60 * 1_000);
    const users = await db.user.findMany({
      where: { quests: { some: { active: true, type: "DAILY" } }, stats: { isNot: null } },
      select: {
        id: true,
        timezone: true,
        quests: {
          where: { active: true, type: "DAILY" },
          select: {
            id: true,
            logs: { where: { completedAt: { gte: recentFloor } }, select: { completedAt: true } },
          },
        },
      },
    });
    let adjusted = 0;
    for (const user of users) {
      if (zonedDateParts(now, user.timezone).hour !== 0) continue;
      const todayStart = startOfZonedDay(now, user.timezone);
      const yesterdayStart = previousZonedDayStart(now, user.timezone);
      const missed = user.quests.filter((quest) => !quest.logs.some(
        (log) => log.completedAt >= yesterdayStart && log.completedAt < todayStart,
      )).length;
      if (!missed) continue;
      const penaltyKey = `DAILY_MISSED:${zonedDateKey(yesterdayStart, user.timezone)}`;
      const alreadyAdjusted = await db.penaltyLog.findFirst({ where: { userId: user.id, reason: { startsWith: penaltyKey } } });
      if (alreadyAdjusted) continue;
      await db.$transaction([
        db.$executeRaw`UPDATE "UserStats" SET "disciplineMeter" = GREATEST(0, "disciplineMeter" - ${Math.min(10, missed * 2)}), "currentStreak" = 0 WHERE "userId" = ${user.id}`,
        db.penaltyLog.create({ data: { userId: user.id, reason: `${penaltyKey} — missed ${missed} daily ${missed === 1 ? "quest" : "quests"}` } }),
      ]);
      adjusted += 1;
    }
    const cleanup = await db.rateLimitBucket.deleteMany({ where: { expiresAt: { lt: now } } });
    await db.jobRun.update({ where: { id: run.id }, data: { status: "complete", finishedAt: new Date(), detail: { adjusted, expiredRateLimits: cleanup.count } } });
    return Response.json({ ok: true, adjusted, expiredRateLimits: cleanup.count, processedAt: now.toISOString() });
  } catch (error) {
    await db.jobRun.update({
      where: { id: run.id },
      data: { status: "failed", finishedAt: new Date(), detail: { message: error instanceof Error ? error.message : "Unknown error" } },
    });
    return Response.json({ error: "Daily reset failed." }, { status: 500 });
  }
}
