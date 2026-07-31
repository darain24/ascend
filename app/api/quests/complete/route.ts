import { completeDatabaseQuest } from "@/lib/progression/complete-quest";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "quest-complete"), { capacity: 20, refillPerSecond: 0.5 })) {
    return Response.json({ error: "Too many completion attempts." }, { status: 429 });
  }
  const { questId: rawQuestId } = (await request.json()) as { questId?: string };
  const questId = rawQuestId?.trim();
  if (!questId) return Response.json({ error: "questId is required" }, { status: 400 });
  try {
    const userId = await requestUserId();
    const result = await completeDatabaseQuest(userId, questId);
    return Response.json({
      hunter: result.hunter,
      xpAwarded: result.awardedXp,
      leveledUp: result.progression.leveledUp,
      rankedUp: result.progression.rankedUp,
      raid: result.raid,
    });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json(
      { error: error instanceof Error ? error.message : "Quest completion failed." },
      { status: 409 },
    );
  }
}
