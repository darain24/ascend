import { db } from "@/lib/db";

export async function GET() {
  const startedAt = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({
      status: "ok",
      database: "connected",
      emailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
      optional: {
        ai: Boolean(process.env.GROQ_API_KEY),
        realtime: Boolean(process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET),
        push: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
      },
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json({ status: "unavailable", database: "disconnected", checkedAt: new Date().toISOString() }, { status: 503 });
  }
}
