import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/email";

export function emailVerificationRequired() {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}

export async function issueEmailVerification({
  userId,
  email,
  origin,
  purpose = "verify",
}: {
  userId: string;
  email: string;
  origin: string;
  purpose?: "verify" | "change";
}) {
  const encodedEmail = Buffer.from(email).toString("base64url");
  const identifier = `email-${purpose}:${userId}:${encodedEmail}`;
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.verificationToken.deleteMany({ where: { identifier } });
  await db.verificationToken.create({
    data: { identifier, token: tokenHash, expires: new Date(Date.now() + 60 * 60 * 1_000) },
  });
  const verificationUrl = `${origin}/verify-email?identifier=${encodeURIComponent(identifier)}&token=${token}`;
  await sendEmailVerification(email, verificationUrl);
}

export function parseEmailVerificationIdentifier(identifier: string) {
  const match = identifier.match(/^email-(verify|change):([^:]+):([A-Za-z0-9_-]+)$/);
  if (!match) return null;
  try {
    return {
      purpose: match[1] as "verify" | "change",
      userId: match[2],
      email: Buffer.from(match[3], "base64url").toString("utf8").trim().toLowerCase(),
    };
  } catch {
    return null;
  }
}
