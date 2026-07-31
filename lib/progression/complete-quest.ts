import { applyXp } from "@/lib/game-logic/engine";
import type { HunterState } from "@/types/game";
import { calculateXpAward, raidDamageFromXp } from "@/lib/game-logic/advanced";
import { db } from "@/lib/db";
import { broadcastGuild } from "@/lib/realtime";

const statField = { STR: "str", VIT: "vit", INT: "int", AGI: "agi", PER: "per" } as const;

export async function completeDatabaseQuest(userId: string, questId: string) {
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
      where: { questId, userId, ...(quest.type === "DAILY" ? { completedAt: { gte: dayStart } } : {}) },
    });
    if (previous) throw new Error("Quest has already been completed.");
    const latestCompletion = await tx.questLog.findFirst({ where: { userId }, orderBy: { completedAt: "desc" } });
    const yesterdayStart = new Date(dayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const currentStreak = latestCompletion?.completedAt && latestCompletion.completedAt >= dayStart
      ? stats.currentStreak
      : latestCompletion?.completedAt && latestCompletion.completedAt >= yesterdayStart
        ? stats.currentStreak + 1
        : 1;
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
        currentStreak,
        longestStreak: Math.max(stats.longestStreak, currentStreak),
        skillPoints: { increment: Math.max(0, gainedLevels) },
        [field]: { increment: 1 },
      },
    });
    const log = await tx.questLog.create({ data: { questId, userId, xpAwarded: awardedXp } });
    await tx.statHistory.create({ data: { userId, stat: quest.category, value: updated[field] } });

    const membership = await tx.guildMember.findFirst({ where: { userId } });
    let raid: { guildId: string; id: string; currentHp: number; maxHp: number; defeated: boolean } | null = null;
    let raidDamage = 0;
    if (membership) {
      const activeRaid = await tx.raidBoss.findFirst({
        where: { guildId: membership.guildId, defeated: false, startsAt: { lte: new Date() }, endsAt: { gt: new Date() } },
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
        await tx.raidContribution.create({ data: { raidBossId: activeRaid.id, userId, questLogId: log.id, damageDealt: raidDamage } });
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
    const rewardKeys = [
      ...(updated.totalCompleted >= 1 ? ["novice-title"] : []),
      ...(updated.level >= 10 ? ["indigo-frame"] : []),
      ...(["C", "B", "A", "S"].includes(updated.rank) ? ["emerald-skin"] : []),
    ];
    if (rewardKeys.length) {
      const rewards = await tx.item.findMany({ where: { key: { in: rewardKeys } }, select: { id: true } });
      await tx.userItem.createMany({
        data: rewards.map((item) => ({ userId, itemId: item.id })),
        skipDuplicates: true,
      });
    }
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
  if (result.raid) await broadcastGuild(result.raid.guildId, "raid-damaged", result.raid);
  return result;
}
