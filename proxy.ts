import { NextResponse } from "next/server";
import { auth } from "@/auth";

const publicPaths = ["/signin", "/signup", "/reset-password", "/privacy", "/terms"];

export default auth((request) => {
  const { pathname, search } = request.nextUrl;
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
