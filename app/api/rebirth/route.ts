import { db } from "@/lib/db";
import { rebirthState } from "@/lib/game-logic/advanced";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function POST(request: Request) {
  try {
    const userId = await requestUserId();
    const result = await db.$transaction(async (tx) => {
      const stats = await tx.userStats.findUnique({ where: { userId } });
      if (!stats) throw new Error("Stats not found.");
      const next = rebirthState({
        rank: stats.rank,
        rebirthCount: stats.rebirthCount,
        globalXpMultiplier: stats.globalXpMultiplier,
      });
      const updated = await tx.userStats.update({
        where: { userId },
        data: next,
      });
      await tx.auditLog.create({
        data: { userId, action: "REBIRTH", delta: 0, resultingState: next },
      });
      return updated;
    });
    return Response.json(result);
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: error instanceof Error ? error.message : "Rebirth failed" }, { status: 409 });
  }
}
