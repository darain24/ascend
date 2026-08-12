import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";
import { startOfZonedDay, zonedDateKey } from "@/lib/timezone";

export async function GET() {
  try {
    const userId = await requestUserId();
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        quests: {
          where: { active: true },
          include: { logs: { orderBy: { completedAt: "desc" }, take: 1 } },
          orderBy: { createdAt: "desc" },
        },
        questLogs: { include: { quest: { select: { category: true } } }, orderBy: { completedAt: "desc" }, take: 365 },
        skills: { include: { skill: true } },
        items: { include: { item: true } },
        weeklyReports: { orderBy: { weekStart: "desc" }, take: 1 },
      },
    });
    if (!user) return Response.json({ error: "Account not found." }, { status: 404 });
    const dayStart = startOfZonedDay(new Date(), user.timezone);
    const stats = user.stats ?? await db.userStats.create({ data: { userId } });
    const activity = user.questLogs.reduce<Record<string, { completed: number; xp: number; stats: Partial<Record<"STR" | "VIT" | "INT" | "AGI" | "PER", number>> }>>((days, log) => {
      const date = zonedDateKey(log.completedAt, user.timezone);
      const current = days[date] ?? { completed: 0, xp: 0, stats: {} };
      days[date] = {
        completed: current.completed + 1,
        xp: current.xp + log.xpAwarded,
        stats: { ...current.stats, [log.quest.category]: (current.stats[log.quest.category] ?? 0) + 1 },
      };
      return days;
    }, {});
    return Response.json({
      profile: {
        name: user.displayName || user.name || "Hunter",
        email: user.email || "",
        avatarUrl: user.avatarUrl || user.image,
        githubUsername: user.githubUsername || "",
        timezone: user.timezone,
      },
      onboarding: {
        completed: Boolean(user.onboardingCompletedAt),
      },
      hunter: {
        level: stats.level,
        xp: stats.currentXp,
        xpToNext: stats.xpToNextLevel,
        rank: stats.rank,
        discipline: stats.disciplineMeter,
        streak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalCompleted: stats.totalCompleted,
        totalXp: stats.totalXpEarned,
        stats: { STR: stats.str, VIT: stats.vit, INT: stats.int, AGI: stats.agi, PER: stats.per },
        hunterClass: stats.hunterClass,
        rebirthCount: stats.rebirthCount,
        globalXpMultiplier: stats.globalXpMultiplier,
      },
      quests: user.quests.map((quest) => ({
        id: quest.id,
        title: quest.title,
        detail: quest.description || "",
        stat: quest.category,
        xp: quest.xpReward,
        type: quest.type,
        difficulty: quest.difficulty,
        completed: quest.logs.length > 0 && (quest.type !== "DAILY" || quest.logs[0].completedAt >= dayStart),
      })),
      activity,
      skillPoints: stats.skillPoints,
      unlockedSkills: user.skills.map(({ skill }) => skill.key),
      inventory: Object.fromEntries(user.items.map(({ item }) => [item.key, 1])),
      equippedItems: user.items.filter((entry) => entry.equipped).map(({ item }) => item),
      weeklyReport: user.weeklyReports[0] ?? null,
    });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Hunter data could not be loaded." }, { status: 500 });
  }
}
