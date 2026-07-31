import { auth } from "@/auth";

export async function requestUserId() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("AUTH_REQUIRED");
  }
  return userId;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "AUTH_REQUIRED") {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }
  return null;
}
