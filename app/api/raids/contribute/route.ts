import { db } from "@/lib/db";
import { raidDamageFromXp } from "@/lib/game-logic/advanced";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";
import { broadcastGuild } from "@/lib/realtime";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(requestRateLimitKey(request, "raid-contribute"), { capacity: 30, refillPerSecond: 0.5 }))) {
      return Response.json({ error: "Too many raid attempts. Try again later." }, { status: 429 });
    }
    const userId = await requestUserId();
    const { raidBossId, questLogId } = (await request.json()) as { raidBossId?: string; questLogId?: string };
    if (!raidBossId || !questLogId) return Response.json({ error: "Raid and quest log are required" }, { status: 400 });
    const result = await db.$transaction(async (tx) => {
      const [raid, log] = await Promise.all([
        tx.raidBoss.findUnique({ where: { id: raidBossId } }),
        tx.questLog.findFirst({ where: { id: questLogId, userId } }),
      ]);
      if (!raid || !log || raid.defeated || raid.startsAt > new Date() || raid.endsAt <= new Date()) {
        throw new Error("Raid contribution is not valid.");
      }
      const membership = await tx.guildMember.findUnique({
        where: { guildId_userId: { guildId: raid.guildId, userId } },
        select: { userId: true },
      });
      if (!membership) throw new Error("Join this raid's guild before contributing.");
      const duplicate = await tx.raidContribution.findUnique({
        where: { raidBossId_questLogId: { raidBossId: raid.id, questLogId: log.id } },
      });
      if (duplicate) throw new Error("This quest has already contributed to the raid.");
      const damage = Math.min(raid.currentHp, raidDamageFromXp(log.xpAwarded));
      const currentHp = Math.max(0, raid.currentHp - damage);
      const updated = await tx.raidBoss.update({
        where: { id: raid.id },
        data: { currentHp, defeated: currentHp === 0 },
      });
      await tx.raidContribution.create({ data: { raidBossId: raid.id, userId, questLogId: log.id, damageDealt: damage } });
      await tx.auditLog.create({ data: { userId, action: "RAID_DAMAGE", delta: damage, resultingState: { raidBossId, currentHp } } });
      return { raid: updated, damage };
    });
    await broadcastGuild(result.raid.guildId, "raid-damaged", result);
    return Response.json(result);
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: error instanceof Error ? error.message : "Raid update failed" }, { status: 409 });
  }
}
