import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";
import { applicationOrigin } from "@/lib/app-url";

export async function POST(request: Request) {
  if (!(await consumeRateLimit(requestRateLimitKey(request, "reset-request"), { capacity: 4, refillPerSecond: 0.01 }))) {
    return Response.json({ error: "Too many reset requests. Try again later." }, { status: 429 });
  }
  const { email: rawEmail } = (await request.json()) as { email?: string };
  const email = rawEmail?.trim().toLowerCase();
  const generic = { message: "If that account exists, a reset link has been sent." };
  if (!email) return Response.json(generic);
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return Response.json(generic);
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.verificationToken.deleteMany({ where: { identifier: `password-reset:${email}` } });
  await db.verificationToken.create({
    data: {
      identifier: `password-reset:${email}`,
      token: tokenHash,
      expires: new Date(Date.now() + 30 * 60 * 1000),
    },
  });
  const baseUrl = applicationOrigin(request);
  const url = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
  try {
    await sendPasswordResetEmail(email, url);
  } catch (error) {
    await db.systemError.create({
      data: { source: "password-reset-email", message: error instanceof Error ? error.message : "Email failure" },
    });
  }
  return Response.json(generic);
}
