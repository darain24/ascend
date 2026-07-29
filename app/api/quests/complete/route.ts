import { applyXp } from "@/lib/game-logic/engine";
import type { HunterState } from "@/types/game";
import { STAT_KEYS, type StatKey } from "@/lib/game-logic/constants";
import { calculateXpAward } from "@/lib/game-logic/advanced";
import { raidDamageFromXp } from "@/lib/game-logic/advanced";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";
import { db } from "@/lib/db";
import { broadcastGuild } from "@/lib/realtime";

const statField = {
  STR: "str",
  VIT: "vit",
  INT: "int",
  AGI: "agi",
  PER: "per",
} as const;

async function completeDatabaseQuest(userId: string, questId: string) {
  const result = await db.$transaction(async (tx) => {
    const [quest, stats, userSkills] = await Promise.all([
      tx.quest.findFirst({ where: { id: questId, userId, active: true } }),
      tx.userStats.findUnique({ where: { userId } }),
      tx.userSkill.findMany({ where: { userId }, include: { skill: true } }),
    ]);
    if (!quest || !stats) throw new Error("Quest or progression state was not found.");
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const previous = await tx.questLog.findFirst({
      where: {
        questId,
        userId,
        ...(quest.type === "DAILY" ? { completedAt: { gte: dayStart } } : {}),
      },
    });
    if (previous) throw new Error("Quest has already been completed.");
    const skillMultiplier = userSkills
      .filter(({ skill }) => skill.perkType === "XP_ALL" || skill.perkType === `XP_${quest.category}`)
      .reduce((multiplier, { skill }) => multiplier + skill.perkValue, 1);
    const awardedXp = calculateXpAward({
      baseXp: quest.xpReward,
      stat: quest.category,
      hunterClass: stats.hunterClass,
      globalMultiplier: stats.globalXpMultiplier,
      skillMultiplier,
    });
    const progression = applyXp(stats.level, stats.currentXp, awardedXp);
    const gainedLevels = progression.level - stats.level;
    const field = statField[quest.category];
    const updated = await tx.userStats.update({
      where: { userId },
      data: {
        level: progression.level,
        currentXp: progression.currentXp,
        xpToNextLevel: progression.xpToNextLevel,
        rank: progression.rank,
        totalCompleted: { increment: 1 },
        totalXpEarned: { increment: awardedXp },
        disciplineMeter: Math.min(100, stats.disciplineMeter + 1),
        skillPoints: { increment: Math.max(0, gainedLevels) },
        [field]: { increment: 1 },
      },
    });
    const log = await tx.questLog.create({
      data: { questId, userId, xpAwarded: awardedXp },
    });
    await tx.statHistory.create({
      data: { userId, stat: quest.category, value: updated[field] },
    });

    const membership = await tx.guildMember.findFirst({ where: { userId } });
    let raid: { guildId: string; id: string; currentHp: number; maxHp: number; defeated: boolean } | null = null;
    let raidDamage = 0;
    if (membership) {
      const activeRaid = await tx.raidBoss.findFirst({
        where: {
          guildId: membership.guildId,
          defeated: false,
          startsAt: { lte: new Date() },
          endsAt: { gt: new Date() },
        },
        orderBy: { startsAt: "desc" },
      });
      if (activeRaid) {
        raidDamage = Math.min(activeRaid.currentHp, raidDamageFromXp(awardedXp));
        const currentHp = Math.max(0, activeRaid.currentHp - raidDamage);
        raid = await tx.raidBoss.update({
          where: { id: activeRaid.id },
          data: { currentHp, defeated: currentHp === 0 },
          select: { guildId: true, id: true, currentHp: true, maxHp: true, defeated: true },
        });
        await tx.raidContribution.create({
          data: { raidBossId: activeRaid.id, userId, damageDealt: raidDamage },
        });
      }
    }
    await tx.auditLog.create({
      data: {
        userId,
        action: "QUEST_COMPLETE",
        delta: awardedXp,
        resultingState: {
          questId,
          questLogId: log.id,
          level: updated.level,
          xp: updated.currentXp,
          rank: updated.rank,
          raidDamage,
          raidHp: raid?.currentHp ?? null,
        },
      },
    });
    const hunter: HunterState = {
      level: updated.level,
      xp: updated.currentXp,
      xpToNext: updated.xpToNextLevel,
      rank: updated.rank,
      discipline: updated.disciplineMeter,
      streak: updated.currentStreak,
      longestStreak: updated.longestStreak,
      totalCompleted: updated.totalCompleted,
      totalXp: updated.totalXpEarned,
      stats: { STR: updated.str, VIT: updated.vit, INT: updated.int, AGI: updated.agi, PER: updated.per },
      hunterClass: updated.hunterClass,
      rebirthCount: updated.rebirthCount,
      globalXpMultiplier: updated.globalXpMultiplier,
    };
    return { hunter, awardedXp, progression, raid };
  }, { isolationLevel: "Serializable" });
  if (result.raid) {
    await broadcastGuild(result.raid.guildId, "raid-damaged", result.raid);
  }
  return result;
}

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "quest-complete"), { capacity: 20, refillPerSecond: 0.5 })) {
    return Response.json({ error: "Too many completion attempts." }, { status: 429 });
  }
  const payload = (await request.json()) as {
    questId?: string;
    snapshot?: HunterState;
    reward?: { xp?: number; stat?: StatKey };
  };
  const questId = payload.questId?.trim();
  if (!questId) return Response.json({ error: "questId is required" }, { status: 400 });
  const databaseUserId = request.headers.get("x-ascend-user-id")?.trim();
  if (databaseUserId) {
    try {
      const result = await completeDatabaseQuest(databaseUserId, questId);
      return Response.json({
        hunter: result.hunter,
        xpAwarded: result.awardedXp,
        leveledUp: result.progression.leveledUp,
        rankedUp: result.progression.rankedUp,
        raid: result.raid,
      });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Quest completion failed." },
        { status: 409 },
      );
    }
  }
  const snapshot = payload.snapshot;
  const xp = payload.reward?.xp;
  const stat = payload.reward?.stat;
  if (
    !snapshot ||
    typeof xp !== "number" ||
    !Number.isFinite(xp) ||
    xp < 1 ||
    xp > 500 ||
    !stat ||
    !STAT_KEYS.includes(stat)
  ) {
    return Response.json({ error: "Valid quest progress is required" }, { status: 400 });
  }

  const awardedXp = calculateXpAward({
    baseXp: xp,
    stat,
    hunterClass: snapshot.hunterClass,
    globalMultiplier: snapshot.globalXpMultiplier,
  });
  const progression = applyXp(snapshot.level, snapshot.xp, awardedXp);
  const hunter: HunterState = {
    ...snapshot,
    level: progression.level,
    xp: progression.currentXp,
    xpToNext: progression.xpToNextLevel,
    rank: progression.rank,
    totalCompleted: snapshot.totalCompleted + 1,
    totalXp: snapshot.totalXp + awardedXp,
    discipline: Math.min(100, snapshot.discipline + 1),
    stats: {
      ...snapshot.stats,
      [stat]: snapshot.stats[stat] + 1,
    },
  };

  return Response.json({
    hunter,
    xpAwarded: awardedXp,
    leveledUp: progression.leveledUp,
    rankedUp: progression.rankedUp,
  });
}
