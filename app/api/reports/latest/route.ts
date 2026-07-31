import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";

export async function GET() {
  try {
    const userId = await requestUserId();
    const report = await db.weeklyReport.findFirst({ where: { userId }, orderBy: { weekStart: "desc" } });
    return Response.json({ report });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Report could not be loaded." }, { status: 500 });
  }
}
