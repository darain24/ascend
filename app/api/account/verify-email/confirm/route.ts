import { createHash } from "crypto";
import { db } from "@/lib/db";
import { parseEmailVerificationIdentifier } from "@/lib/auth/email-verification";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!(await consumeRateLimit(requestRateLimitKey(request, "verify-email-confirm"), { capacity: 8, refillPerSecond: 1 / 30 }))) {
    return Response.json({ error: "Too many verification attempts. Try again later." }, { status: 429 });
  }
  const { identifier = "", token = "" } = (await request.json()) as { identifier?: string; token?: string };
  const parsed = parseEmailVerificationIdentifier(identifier);
  if (!parsed || !token) return Response.json({ error: "The verification link is invalid." }, { status: 400 });
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await db.verificationToken.findFirst({ where: { identifier, token: tokenHash, expires: { gt: new Date() } } });
  if (!record) return Response.json({ error: "The verification link is invalid or expired." }, { status: 400 });
  try {
    await db.$transaction([
      db.user.update({
        where: { id: parsed.userId },
        data: parsed.purpose === "change" ? { email: parsed.email, emailVerified: new Date() } : { emailVerified: new Date() },
      }),
      db.verificationToken.deleteMany({ where: { identifier } }),
    ]);
    return Response.json({ verified: true });
  } catch {
    return Response.json({ error: "That email is already used by another account." }, { status: 409 });
  }
}
