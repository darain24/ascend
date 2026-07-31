import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";
import { validatePassword } from "@/lib/security/password";

export async function POST(request: Request) {
  if (!consumeRateLimit(requestRateLimitKey(request, "signup"), { capacity: 5, refillPerSecond: 0.02 })) {
    return Response.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }
  const body = (await request.json()) as { name?: string; email?: string; password?: string };
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!name || name.length < 2 || name.length > 80 || !email || !email.includes("@")) {
    return Response.json({ error: "Enter a valid name and email address." }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) return Response.json({ error: passwordError }, { status: 400 });
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  const user = await db.user.create({
    data: {
      name,
      displayName: name,
      email,
      passwordHash: await hash(password, 12),
      stats: { create: {} },
    },
    select: { id: true, name: true, email: true },
  });
  return Response.json({ user }, { status: 201 });
}
