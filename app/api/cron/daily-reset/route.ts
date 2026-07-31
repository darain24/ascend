import { db } from "@/lib/db";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  const jobName = `daily-reset:${todayStart.toISOString().slice(0, 10)}`;
  const completedRun = await db.jobRun.findFirst({ where: { job: jobName, status: "complete" } });
  if (completedRun) return Response.json({ ok: true, alreadyProcessed: true });
  const run = await db.jobRun.create({ data: { job: jobName, status: "running" } });
  try {
    const users = await db.user.findMany({
      where: { quests: { some: { active: true, type: "DAILY" } }, stats: { isNot: null } },
      select: {
        id: true,
        quests: {
          where: { active: true, type: "DAILY" },
          select: {
            id: true,
            logs: { where: { completedAt: { gte: yesterdayStart, lt: todayStart } }, select: { id: true }, take: 1 },
          },
        },
      },
    });
    let adjusted = 0;
    for (const user of users) {
      const missed = user.quests.filter((quest) => quest.logs.length === 0).length;
      if (!missed) continue;
      await db.$transaction([
        db.$executeRaw`UPDATE "UserStats" SET "disciplineMeter" = GREATEST(0, "disciplineMeter" - ${Math.min(10, missed * 2)}), "currentStreak" = 0 WHERE "userId" = ${user.id}`,
        db.penaltyLog.create({ data: { userId: user.id, reason: `Missed ${missed} daily ${missed === 1 ? "quest" : "quests"}` } }),
      ]);
      adjusted += 1;
    }
    await db.jobRun.update({ where: { id: run.id }, data: { status: "complete", finishedAt: new Date(), detail: { adjusted } } });
    return Response.json({ ok: true, adjusted, processedAt: now.toISOString() });
  } catch (error) {
    await db.jobRun.update({
      where: { id: run.id },
      data: { status: "failed", finishedAt: new Date(), detail: { message: error instanceof Error ? error.message : "Unknown error" } },
    });
    return Response.json({ error: "Daily reset failed." }, { status: 500 });
  }
}
