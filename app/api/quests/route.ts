import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";
import { DIFFICULTY_XP, STAT_KEYS } from "@/lib/game-logic/constants";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    if (!consumeRateLimit(requestRateLimitKey(request, "quest-create"), { capacity: 20, refillPerSecond: 0.25 })) {
      return Response.json({ error: "Too many quests created. Try again shortly." }, { status: 429 });
    }
    const userId = await requestUserId();
    const body = (await request.json()) as {
      title?: string;
      detail?: string;
      stat?: string;
      difficulty?: keyof typeof DIFFICULTY_XP;
      type?: "DAILY" | "CUSTOM" | "DUNGEON";
    };
    const title = body.title?.trim();
    const difficulty = body.difficulty ?? "NORMAL";
    if (!title || title.length > 120 || !body.stat || !STAT_KEYS.includes(body.stat as never) || !(difficulty in DIFFICULTY_XP)) {
      return Response.json({ error: "Enter a valid quest." }, { status: 400 });
    }
    const quest = await db.quest.create({
      data: {
        userId,
        title,
        description: body.detail?.trim().slice(0, 500) || null,
        category: body.stat as "STR" | "VIT" | "INT" | "AGI" | "PER",
        difficulty,
        type: body.type ?? "CUSTOM",
        xpReward: DIFFICULTY_XP[difficulty],
      },
    });
    return Response.json({
      quest: {
        id: quest.id,
        title: quest.title,
        detail: quest.description || "",
        stat: quest.category,
        difficulty: quest.difficulty,
        type: quest.type,
        xp: quest.xpReward,
        completed: false,
      },
    }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Quest could not be created." }, { status: 500 });
  }
}
