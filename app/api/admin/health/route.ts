import { db } from "@/lib/db";

export async function GET(request: Request) {
  const email = request.headers.get("x-admin-email");
  const token = request.headers.get("authorization");
  if (
    !process.env.ADMIN_EMAIL ||
    !process.env.ADMIN_API_SECRET ||
    email !== process.env.ADMIN_EMAIL ||
    token !== `Bearer ${process.env.ADMIN_API_SECRET}`
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const [jobs, errors, users, quests] = await Promise.all([
    db.jobRun.findMany({ orderBy: { startedAt: "desc" }, take: 20 }),
    db.systemError.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.user.count(),
    db.quest.count(),
  ]);
  return Response.json({ status: "ok", users, quests, jobs, errors, checkedAt: new Date().toISOString() });
}
