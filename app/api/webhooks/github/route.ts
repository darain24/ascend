import { db } from "@/lib/db";
import { verifyGitHubSignature } from "@/lib/security/webhook";

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
      user: { displayName: { equals: login, mode: "insensitive" } },
    },
  });
  if (!quest) return Response.json({ accepted: true, matched: false });
  return Response.json({
    accepted: true,
    matched: true,
    questId: quest.id,
    commits: payload.commits?.length ?? 0,
  });
}
