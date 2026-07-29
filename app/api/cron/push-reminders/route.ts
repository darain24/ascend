import webPush from "web-push";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
    return Response.json({ error: "VAPID keys are not configured" }, { status: 503 });
  }
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const subscriptions = await db.pushSubscription.findMany({
    where: { enabled: true, user: { quests: { some: { active: true, logs: { none: { completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } } } } } },
  });
  let sent = 0;
  await Promise.all(subscriptions.map(async (subscription) => {
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
