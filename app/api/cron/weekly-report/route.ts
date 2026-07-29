import { db } from "@/lib/db";
import { generateHunterReport } from "@/lib/ai/groq";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const run = await db.jobRun.create({ data: { job: "weekly-report", status: "running" } });
  let generated = 0;
  try {
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const users = await db.user.findMany({
      where: { stats: { isNot: null } },
      include: {
        stats: true,
        questLogs: { where: { completedAt: { gte: weekStart } }, include: { quest: true } },
        journalEntries: { orderBy: { createdAt: "desc" }, take: 8 },
      },
    });
    for (const user of users) {
      const context = JSON.stringify({
        stats: user.stats,
        quests: user.questLogs.map((log) => ({ title: log.quest.title, stat: log.quest.category, xp: log.xpAwarded })),
        journals: user.journalEntries.map((entry) => entry.content),
      });
      const content = await generateHunterReport(context);
      await db.weeklyReport.upsert({
        where: { userId_weekStart: { userId: user.id, weekStart } },
        update: { content },
        create: { userId: user.id, weekStart, content },
      });
      generated += 1;
    }
    await db.jobRun.update({ where: { id: run.id }, data: { status: "complete", finishedAt: new Date(), detail: { generated } } });
    return Response.json({ ok: true, generated });
  } catch (error) {
    await db.jobRun.update({ where: { id: run.id }, data: { status: "failed", finishedAt: new Date(), detail: { message: error instanceof Error ? error.message : "Unknown error" } } });
    return Response.json({ error: "Weekly report job failed" }, { status: 500 });
  }
}
