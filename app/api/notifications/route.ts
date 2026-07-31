import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";

export async function GET(request: Request) {
  try {
    const userId = await requestUserId();
    const timezoneOffset = Number(new URL(request.url).searchParams.get("timezoneOffset")) || 0;
    const shiftedNow = new Date(Date.now() - timezoneOffset * 60_000);
    shiftedNow.setUTCHours(23, 59, 59, 999);
    const localDayEnd = new Date(shiftedNow.getTime() + timezoneOffset * 60_000);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const [quests, membership] = await Promise.all([
      db.quest.findMany({
        where: {
          userId,
          active: true,
          logs: { none: { completedAt: { gte: dayStart } } },
        },
        orderBy: { createdAt: "asc" },
        take: 8,
      }),
      db.guildMember.findFirst({
        where: { userId },
        include: {
          guild: {
            include: {
              raidBosses: {
                where: { defeated: false, startsAt: { lte: new Date() }, endsAt: { gt: new Date() } },
                orderBy: { endsAt: "asc" },
                take: 1,
              },
            },
          },
        },
      }),
    ]);
    const events: Array<{
      id: string;
      title: string;
      description: string;
      category: "quest" | "challenge";
      startsAt: string;
      targetView: "quests" | "guild";
    }> = quests.map((quest) => ({
      id: `quest:${quest.id}:${dayStart.toISOString().slice(0, 10)}`,
      title: quest.title,
      description: `${quest.difficulty.toLowerCase()} ${quest.category} quest · ${quest.xpReward} base XP`,
      category: "quest" as const,
      startsAt: localDayEnd.toISOString(),
      targetView: "quests" as const,
    }));
    const raid = membership?.guild.raidBosses[0];
    if (raid) {
      events.push({
        id: `raid:${raid.id}`,
        title: `${raid.name} ends soon`,
        description: `${raid.currentHp.toLocaleString()} of ${raid.maxHp.toLocaleString()} HP remains for ${membership!.guild.name}.`,
        category: "challenge",
        startsAt: raid.endsAt.toISOString(),
        targetView: "guild",
      });
    }
    return Response.json({ profileId: userId, events });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Upcoming events could not be loaded." }, { status: 500 });
  }
}
