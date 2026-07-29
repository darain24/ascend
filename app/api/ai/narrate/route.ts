import { generateNarration } from "@/lib/ai/groq";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "ai-narrate"), { capacity: 12, refillPerSecond: 0.2 })) {
    return Response.json({ message: null });
  }
  const payload = (await request.json()) as { context?: string };
  if (!payload.context) return Response.json({ message: null });
  return Response.json({ message: await generateNarration(payload.context) });
}
