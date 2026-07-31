import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function POST(request: Request) {
  try {
    const userId = await requestUserId();
    const subscription = (await request.json()) as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys.auth) {
      return Response.json({ error: "Invalid push subscription" }, { status: 400 });
    }
    await db.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { userId, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, enabled: true },
      create: { userId, endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    });
    return Response.json({ subscribed: true });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Push subscription failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requestUserId();
    const { endpoint } = (await request.json()) as { endpoint?: string };
    if (endpoint) {
      await db.pushSubscription.updateMany({ where: { userId, endpoint }, data: { enabled: false } });
    }
    return Response.json({ subscribed: false });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Push subscription could not be disabled." }, { status: 500 });
  }
}
