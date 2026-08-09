export function applicationOrigin(request: Request) {
  const value = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const url = new URL(value);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  return url.origin;
}
