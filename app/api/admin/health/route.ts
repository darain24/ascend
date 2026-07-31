import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!process.env.ADMIN_EMAIL || session?.user?.email?.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const [jobs, errors, users, quests, levels] = await Promise.all([
    db.jobRun.findMany({ orderBy: { startedAt: "desc" }, take: 20 }),
    db.systemError.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.user.count(),
    db.quest.count(),
    db.userStats.groupBy({ by: ["level"], _count: { level: true }, orderBy: { level: "asc" }, take: 20 }),
  ]);
  return Response.json({ status: "ok", users, quests, jobs, errors, levels, checkedAt: new Date().toISOString() });
}
