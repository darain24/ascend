export function requestUserId(request: Request) {
  const userId = request.headers.get("x-ascend-user-id")?.trim();
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
