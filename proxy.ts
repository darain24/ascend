import { NextResponse } from "next/server";
import { auth } from "@/auth";

const publicPaths = ["/signin", "/signup", "/reset-password", "/privacy", "/terms"];

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
  const isUnsafeApiRequest = pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const isExternalApi = pathname.startsWith("/api/auth/") || pathname.startsWith("/api/webhooks/");
  if (isUnsafeApiRequest && !isExternalApi) {
    const origin = request.headers.get("origin");
    let configuredOrigin = request.nextUrl.origin;
    try {
      if (process.env.NEXT_PUBLIC_APP_URL) configuredOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL).origin;
    } catch {
      configuredOrigin = request.nextUrl.origin;
    }
    const crossSite = request.headers.get("sec-fetch-site") === "cross-site";
    if (crossSite || (origin && origin !== request.nextUrl.origin && origin !== configuredOrigin)) {
      return Response.json({ error: "Cross-site request rejected." }, { status: 403 });
    }
  }
  const isPublicPage = publicPaths.some((path) => pathname === path);
  const isPublicRequest =
    isPublicPage ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/account/signup") ||
    pathname.startsWith("/api/account/reset-password") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.svg" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js";

  if (request.auth && isPublicPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (!request.auth && !isPublicRequest) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$).*)", "/", "/(api|trpc)(.*)"],
};
