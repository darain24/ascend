import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { validatePassword } from "@/lib/security/password";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "reset-confirm"), { capacity: 6, refillPerSecond: 0.02 })) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const { email: rawEmail, token = "", password = "" } = (await request.json()) as {
    email?: string;
    token?: string;
    password?: string;
  };
  const email = rawEmail?.trim().toLowerCase();
  const passwordError = validatePassword(password);
  if (!email || !token || passwordError) {
    return Response.json({ error: passwordError || "The reset link is invalid." }, { status: 400 });
  }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const identifier = `password-reset:${email}`;
  const record = await db.verificationToken.findFirst({
    where: { identifier, token: tokenHash, expires: { gt: new Date() } },
  });
  if (!record) return Response.json({ error: "The reset link is invalid or expired." }, { status: 400 });
  await db.$transaction([
    db.user.update({ where: { email }, data: { passwordHash: await hash(password, 12) } }),
    db.verificationToken.deleteMany({ where: { identifier } }),
  ]);
  return Response.json({ changed: true });
}
