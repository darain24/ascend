import { db } from "@/lib/db";
import { applicationOrigin } from "@/lib/app-url";
import { issueEmailVerification } from "@/lib/auth/email-verification";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const generic = { message: "If that account exists, a verification link has been sent." };
  try {
    if (!(await consumeRateLimit(requestRateLimitKey(request, "verify-email-request"), { capacity: 4, refillPerSecond: 1 / 120 }))) {
      return Response.json({ error: "Too many verification requests. Try again later." }, { status: 429 });
    }
    const { email: rawEmail } = (await request.json()) as { email?: string };
    const email = rawEmail?.trim().toLowerCase();
    if (!email) return Response.json(generic);
    const user = await db.user.findUnique({ where: { email }, select: { id: true, emailVerified: true } });
    if (!user || user.emailVerified) return Response.json(generic);
    await issueEmailVerification({ userId: user.id, email, origin: applicationOrigin(request) });
    return Response.json(generic);
  } catch (error) {
    await db.systemError.create({ data: { source: "email-verification", message: error instanceof Error ? error.message : "Verification email failure" } }).catch(() => undefined);
    return Response.json(generic);
  }
}
