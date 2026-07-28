import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PROFILE_COOKIE = "ascend_profile";
const MINUTE = 60_000;
const DAY = 86_400_000;

type EventCategory = "quest" | "challenge" | "milestone" | "reward";

function hashProfile(profileId: string) {
  return [...profileId].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function localTime(
  now: Date,
  timezoneOffset: number,
  daysFromToday: number,
  hour: number,
  minute = 0,
) {
  const localNow = new Date(now.getTime() - timezoneOffset * MINUTE);
  const localTimestamp = Date.UTC(
    localNow.getUTCFullYear(),
    localNow.getUTCMonth(),
    localNow.getUTCDate() + daysFromToday,
    hour,
    minute,
  );
  return new Date(localTimestamp + timezoneOffset * MINUTE);
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const existingProfileId = cookieStore.get(PROFILE_COOKIE)?.value;
  const profileId = existingProfileId ?? randomUUID();
  const parsedOffset = Number(request.nextUrl.searchParams.get("timezoneOffset"));
  const timezoneOffset = Number.isFinite(parsedOffset) ? parsedOffset : 0;
  const now = new Date();
  const localNow = new Date(now.getTime() - timezoneOffset * MINUTE);
  const daysUntilSunday = (7 - localNow.getUTCDay()) % 7;
  const profileVariant = hashProfile(profileId) % 3;

  const personalEvents = [
    {
      title: "Focused reading session",
      description: "A 30-minute focus quest is ready for tomorrow morning.",
      category: "quest" as EventCategory,
      startsAt: localTime(now, timezoneOffset, 1, 8).toISOString(),
      targetView: "quests",
    },
    {
      title: "Recovery check-in",
      description: "Review your discipline meter and choose a sustainable goal.",
      category: "milestone" as EventCategory,
      startsAt: localTime(now, timezoneOffset, 1, 18).toISOString(),
      targetView: "journey",
    },
    {
      title: "Attribute review",
      description: "See which personal attribute needs attention this week.",
      category: "milestone" as EventCategory,
      startsAt: localTime(now, timezoneOffset, 2, 9).toISOString(),
      targetView: "analytics",
    },
  ];

  const events = [
    {
      id: `${profileId}:daily-reset`,
      title: "Daily quests reset",
      description: "Finish or reschedule today’s open quests before the new day begins.",
      category: "quest" as EventCategory,
      startsAt: localTime(now, timezoneOffset, 0, 23, 59).toISOString(),
      targetView: "quests",
    },
    {
      id: `${profileId}:weekly-challenge`,
      title: "Weekly challenge ends",
      description: "Your 20 km challenge closes on Sunday evening.",
      category: "challenge" as EventCategory,
      startsAt: localTime(now, timezoneOffset, daysUntilSunday, 21).toISOString(),
      targetView: "journey",
    },
    {
      id: `${profileId}:personal-${profileVariant}`,
      ...personalEvents[profileVariant],
    },
    {
      id: `${profileId}:rank-review`,
      title: "Rank progress review",
      description: "Check your progress toward Rank C and available skill points.",
      category: "reward" as EventCategory,
      startsAt: new Date(now.getTime() + 3 * DAY).toISOString(),
      targetView: "journey",
    },
  ].sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt));

  const response = NextResponse.json({ profileId, events });
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
