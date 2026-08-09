import { compare, hash } from "bcryptjs";
import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";
import { validatePassword } from "@/lib/security/password";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    if (!(await consumeRateLimit(requestRateLimitKey(request, "change-password"), { capacity: 5, refillPerSecond: 0.02 }))) {
      return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    const userId = await requestUserId();
    const { currentPassword = "", newPassword = "" } = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    const passwordError = validatePassword(newPassword);
    if (passwordError) return Response.json({ error: passwordError }, { status: 400 });
    const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) return Response.json({ error: "Account not found." }, { status: 404 });
    if (user.passwordHash && !(await compare(currentPassword, user.passwordHash))) {
      return Response.json({ error: "The current password is incorrect." }, { status: 400 });
    }
    await db.user.update({ where: { id: userId }, data: { passwordHash: await hash(newPassword, 12) } });
    return Response.json({ changed: true });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Password could not be changed." }, { status: 500 });
  }
}
