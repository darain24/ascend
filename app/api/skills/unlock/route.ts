import { db } from "@/lib/db";
import { canUnlockSkill } from "@/lib/game-logic/advanced";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function POST(request: Request) {
  try {
    const userId = await requestUserId();
    const { skillKey } = (await request.json()) as { skillKey?: string };
    if (!skillKey) return Response.json({ error: "skillKey is required" }, { status: 400 });
    const result = await db.$transaction(async (tx) => {
      const [skill, stats, unlocked] = await Promise.all([
        tx.skill.findUnique({ where: { key: skillKey } }),
        tx.userStats.findUnique({ where: { userId } }),
        tx.userSkill.findMany({ where: { userId }, select: { skillId: true } }),
      ]);
      if (!skill || !stats) throw new Error("NOT_FOUND");
      const unlockedIds = unlocked.map((entry) => entry.skillId);
      if (unlockedIds.includes(skill.id)) throw new Error("ALREADY_UNLOCKED");
      if (!canUnlockSkill({
        cost: skill.cost,
        availablePoints: stats.skillPoints,
        prerequisiteSkillId: skill.prerequisiteSkillId,
        unlockedSkillIds: unlockedIds,
      })) throw new Error("LOCKED");
      await tx.userStats.update({
        where: { userId },
        data: { skillPoints: { decrement: skill.cost } },
      });
      const userSkill = await tx.userSkill.create({ data: { userId, skillId: skill.id } });
      await tx.auditLog.create({
        data: { userId, action: "SKILL_UNLOCK", delta: -skill.cost, resultingState: { skillId: skill.id, skillPoints: stats.skillPoints - skill.cost } },
      });
      return userSkill;
    });
    return Response.json(result);
  } catch (error) {
    const auth = authErrorResponse(error);
    if (auth) return auth;
    return Response.json({ error: error instanceof Error ? error.message : "Unlock failed" }, { status: 409 });
  }
}
