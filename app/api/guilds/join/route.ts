import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";
import { broadcastGuild } from "@/lib/realtime";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(requestRateLimitKey(request, "guild-join"), { capacity: 8, refillPerSecond: 1 / 30 }))) {
      return Response.json({ error: "Too many invite attempts. Try again later." }, { status: 429 });
    }
    const userId = await requestUserId();
    const { inviteCode } = (await request.json()) as { inviteCode?: string };
    const existing = await db.guildMember.findFirst({ where: { userId } });
    if (existing) return Response.json({ error: "You already belong to a guild." }, { status: 409 });
    const guild = await db.guild.findUnique({ where: { inviteCode: inviteCode?.trim().toUpperCase() } });
    if (!guild) return Response.json({ error: "Invite code not found" }, { status: 404 });
    const membership = await db.guildMember.create({ data: { guildId: guild.id, userId } });
    await broadcastGuild(guild.id, "member-joined", { userId, role: membership.role });
    return Response.json({ membership });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Could not join guild" }, { status: 409 });
  }
}
