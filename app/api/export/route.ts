import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function GET(request: Request) {
  try {
    const userId = await requestUserId();
    const format = new URL(request.url).searchParams.get("format") ?? "json";
    const [questLogs, statHistory, journals] = await Promise.all([
      db.questLog.findMany({ where: { userId }, include: { quest: true }, orderBy: { completedAt: "asc" } }),
      db.statHistory.findMany({ where: { userId }, orderBy: { recordedAt: "asc" } }),
      db.journalEntry.findMany({ where: { userId }, select: { id: true, content: true, createdAt: true }, orderBy: { createdAt: "asc" } }),
    ]);
    if (format === "csv") {
      const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
      const rows = [
        ["type", "date", "title", "value", "detail"],
        ...questLogs.map((log) => ["quest", log.completedAt.toISOString(), log.quest.title, log.xpAwarded, log.quest.category]),
        ...statHistory.map((entry) => ["stat", entry.recordedAt.toISOString(), entry.stat, entry.value, ""]),
        ...journals.map((entry) => ["journal", entry.createdAt.toISOString(), "Journal", "", entry.content]),
      ];
      return new Response(rows.map((row) => row.map(escape).join(",")).join("\n"), {
        headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="ascend-export.csv"' },
      });
    }
    return new Response(JSON.stringify({ questLogs, statHistory, journals }, null, 2), {
      headers: { "content-type": "application/json", "content-disposition": 'attachment; filename="ascend-export.json"' },
    });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Export failed" }, { status: 500 });
  }
}
