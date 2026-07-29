import { answerSystemQuestion } from "@/lib/ai/groq";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "ai-ask"), { capacity: 8, refillPerSecond: 1 / 20 })) {
    return Response.json({ error: "Too many questions. Try again shortly." }, { status: 429 });
  }
  const payload = (await request.json()) as {
    question?: string;
    entries?: Array<{ content: string; createdAt: string }>;
  };
  const question = payload.question?.trim();
  if (!question) return Response.json({ error: "Question is required." }, { status: 400 });
  const context = (payload.entries ?? [])
    .slice(-12)
    .map((entry) => `${entry.createdAt}: ${entry.content}`)
    .join("\n");
  try {
    return Response.json({ answer: await answerSystemQuestion(question, context) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "The System could not answer." },
      { status: 503 },
    );
  }
}
