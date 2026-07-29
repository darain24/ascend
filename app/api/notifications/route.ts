import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PROFILE_COOKIE = "ascend_profile";

export async function GET() {
  const cookieStore = await cookies();
  const existingProfileId = cookieStore.get(PROFILE_COOKIE)?.value;
  const profileId = existingProfileId ?? randomUUID();
  const response = NextResponse.json({ profileId, events: [] });
  if (!existingProfileId) {
    response.cookies.set(PROFILE_COOKIE, profileId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
