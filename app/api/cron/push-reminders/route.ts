import webPush from "web-push";
import { db } from "@/lib/db";
import { startOfZonedDay, zonedDateParts } from "@/lib/timezone";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    return Response.json({ error: "VAPID keys are not configured" }, { status: 503 });
  }
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const recentFloor = new Date(Date.now() - 36 * 60 * 60 * 1_000);
  const subscriptions = await db.pushSubscription.findMany({
    where: { enabled: true },
    include: {
      user: {
        select: {
          timezone: true,
          quests: {
            where: { active: true },
            select: { logs: { where: { completedAt: { gte: recentFloor } }, select: { completedAt: true } } },
          },
        },
      },
    },
  });
  let sent = 0;
  await Promise.all(subscriptions.map(async (subscription) => {
    const now = new Date();
    if (zonedDateParts(now, subscription.user.timezone).hour !== 18) return;
    const dayStart = startOfZonedDay(now, subscription.user.timezone);
    const hasOpenQuest = subscription.user.quests.some((quest) => !quest.logs.some((log) => log.completedAt >= dayStart));
    if (!hasOpenQuest) return;
    try {
      await webPush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify({ title: "Ascend quest reminder", body: "You still have an open quest today.", url: "/" }),
      );
      sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await db.pushSubscription.update({ where: { id: subscription.id }, data: { enabled: false } });
      }
    }
  }));
  return Response.json({ ok: true, sent });
}
