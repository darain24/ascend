import { db } from "@/lib/db";
import { verifyGitHubSignature } from "@/lib/security/webhook";
import { completeDatabaseQuest } from "@/lib/progression/complete-quest";

export async function POST(request: Request) {
  const body = await request.text();
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";
  if (!verifyGitHubSignature(body, request.headers.get("x-hub-signature-256"), secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  const event = request.headers.get("x-github-event");
  if (event !== "push") return Response.json({ accepted: true, matched: false });
  const payload = JSON.parse(body) as { sender?: { login?: string }; commits?: unknown[] };
  const login = payload.sender?.login;
  if (!login) return Response.json({ accepted: true, matched: false });

  const quest = await db.quest.findFirst({
    where: {
      active: true,
      title: { contains: "code", mode: "insensitive" },
      user: { githubUsername: { equals: login, mode: "insensitive" } },
    },
  });
  if (!quest) return Response.json({ accepted: true, matched: false });
  try {
    const completion = await completeDatabaseQuest(quest.userId, quest.id);
    return Response.json({
      accepted: true,
      matched: true,
      completed: true,
      questId: quest.id,
      xpAwarded: completion.awardedXp,
      commits: payload.commits?.length ?? 0,
    });
  } catch (error) {
    return Response.json({
      accepted: true,
      matched: true,
      completed: false,
      reason: error instanceof Error ? error.message : "Completion failed",
    }, { status: 409 });
  }
}
