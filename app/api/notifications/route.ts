import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";
import { endOfZonedDay, startOfZonedDay, zonedDateKey } from "@/lib/timezone";

export async function GET() {
  try {
    const userId = await requestUserId();
    const user = await db.user.findUnique({ where: { id: userId }, select: { timezone: true } });
    if (!user) return Response.json({ error: "Account not found." }, { status: 404 });
    const now = new Date();
    const dayStart = startOfZonedDay(now, user.timezone);
    const localDayEnd = endOfZonedDay(now, user.timezone);
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
      id: `quest:${quest.id}:${zonedDateKey(now, user.timezone)}`,
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
