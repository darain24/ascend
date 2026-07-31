import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";
import { realtimeServer } from "@/lib/realtime";

export async function POST(request: Request) {
  try {
    const userId = await requestUserId();
    const body = await request.formData();
    const socketId = String(body.get("socket_id") ?? "");
    const channelName = String(body.get("channel_name") ?? "");
    const guildId = channelName.startsWith("private-guild-") ? channelName.slice("private-guild-".length) : "";
    if (!socketId || !guildId) return Response.json({ error: "Invalid channel." }, { status: 400 });
    const membership = await db.guildMember.findUnique({ where: { guildId_userId: { guildId, userId } } });
    if (!membership) return Response.json({ error: "Forbidden" }, { status: 403 });
    const pusher = realtimeServer();
    if (!pusher) return Response.json({ error: "Realtime is not configured." }, { status: 503 });
    return Response.json(pusher.authorizeChannel(socketId, channelName));
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Channel authorization failed." }, { status: 500 });
  }
}
