import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";
import { consumeRateLimit, requestRateLimitKey } from "@/lib/security/rate-limit";

export async function DELETE(request: Request) {
  try {
    if (!(await consumeRateLimit(requestRateLimitKey(request, "delete-account"), { capacity: 3, refillPerSecond: 1 / 300 }))) {
      return Response.json({ error: "Too many deletion attempts. Try again later." }, { status: 429 });
    }
    const userId = await requestUserId();
    const { password = "", confirmation = "" } = (await request.json()) as {
      password?: string;
      confirmation?: string;
    };
    if (confirmation !== "DELETE") {
      return Response.json({ error: "Type DELETE to confirm permanent account removal." }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
    if (!user) return Response.json({ error: "Account not found." }, { status: 404 });
    if (user.passwordHash && !(await compare(password, user.passwordHash))) {
      return Response.json({ error: "The current password is incorrect." }, { status: 400 });
    }
    await db.user.delete({ where: { id: userId } });
    return Response.json({ deleted: true });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Account could not be deleted." }, { status: 500 });
  }
}
