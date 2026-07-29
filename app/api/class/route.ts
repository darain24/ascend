import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

const CLASSES = ["ASSASSIN", "MAGE", "TANK"] as const;

export async function POST(request: Request) {
  try {
    const userId = requestUserId(request);
    const { hunterClass } = (await request.json()) as { hunterClass?: (typeof CLASSES)[number] };
    if (!hunterClass || !CLASSES.includes(hunterClass)) {
      return Response.json({ error: "Invalid class" }, { status: 400 });
    }
    const stats = await db.userStats.findUnique({ where: { userId } });
    if (!stats || stats.level < 10) return Response.json({ error: "Level 10 is required." }, { status: 409 });
    if (stats.hunterClass) return Response.json({ error: "Class has already been selected." }, { status: 409 });
    const updated = await db.userStats.update({ where: { userId }, data: { hunterClass } });
    return Response.json({ stats: updated });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Class selection failed" }, { status: 500 });
  }
}
