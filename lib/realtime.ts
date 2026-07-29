import Pusher from "pusher";

export function realtimeServer() {
  const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;
  if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) return null;
  return new Pusher({
    appId: PUSHER_APP_ID,
    key: PUSHER_KEY,
    secret: PUSHER_SECRET,
    cluster: PUSHER_CLUSTER,
    useTLS: true,
  });
}

export async function broadcastGuild(guildId: string, event: string, payload: unknown) {
  const pusher = realtimeServer();
  if (!pusher) return;
  await pusher.trigger(`private-guild-${guildId}`, event, payload);
}
