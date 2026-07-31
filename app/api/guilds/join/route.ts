import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";
import { broadcastGuild } from "@/lib/realtime";

export async function POST(request: Request) {
  try {
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
