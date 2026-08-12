import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function PATCH() {
  try {
    const userId = await requestUserId();
    const user = await db.user.update({
      where: { id: userId },
      data: { onboardingCompletedAt: new Date() },
      select: { onboardingCompletedAt: true },
    });

    return Response.json({ completed: Boolean(user.onboardingCompletedAt) });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Onboarding could not be completed." }, { status: 500 });
  }
}
