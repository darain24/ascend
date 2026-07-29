import { generateQuestChain } from "@/lib/ai/groq";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "ai-quests"), { capacity: 5, refillPerSecond: 1 / 30 })) {
    return Response.json({ error: "Too many AI requests. Try again shortly." }, { status: 429 });
  }
  const payload = (await request.json()) as { goal?: string };
  const goal = payload.goal?.trim();
  if (!goal || goal.length < 3 || goal.length > 1200) {
    return Response.json({ error: "Describe a goal between 3 and 1,200 characters." }, { status: 400 });
  }
  try {
    return Response.json({ quests: await generateQuestChain(goal) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Quest generation failed." },
      { status: 503 },
    );
  }
}
