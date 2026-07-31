import { db } from "@/lib/db";
import { broadcastGuild } from "@/lib/realtime";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const run = await db.jobRun.create({ data: { job: "weekly-raid", status: "running" } });
  try {
    const now = new Date();
    const endsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const guilds = await db.guild.findMany({ include: { _count: { select: { members: true } } } });
    let created = 0;
    for (const guild of guilds) {
      const active = await db.raidBoss.findFirst({
        where: { guildId: guild.id, defeated: false, endsAt: { gt: now } },
      });
      if (active) continue;
      const maxHp = Math.max(500, guild._count.members * 750);
      const raid = await db.raidBoss.create({
        data: { guildId: guild.id, name: "Weekly Gate Guardian", maxHp, currentHp: maxHp, startsAt: now, endsAt },
      });
      await broadcastGuild(guild.id, "raid-created", raid);
      created += 1;
    }
    await db.jobRun.update({ where: { id: run.id }, data: { status: "complete", finishedAt: new Date(), detail: { created } } });
    return Response.json({ ok: true, created });
  } catch (error) {
    await db.jobRun.update({
      where: { id: run.id },
      data: { status: "failed", finishedAt: new Date(), detail: { message: error instanceof Error ? error.message : "Unknown error" } },
    });
    return Response.json({ error: "Weekly raid job failed." }, { status: 500 });
  }
}
