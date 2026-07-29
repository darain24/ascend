import { db } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const guildId = url.searchParams.get("guildId");
  const take = 25;
  // Short CDN caching keeps this read-heavy endpoint inexpensive while allowing
  // progression changes to become visible within one minute.
  const rows = await db.userStats.findMany({
    where: guildId ? { user: { guildMemberships: { some: { guildId } } } } : undefined,
    orderBy: [{ level: "desc" }, { totalXpEarned: "desc" }, { currentStreak: "desc" }],
    skip: (page - 1) * take,
    take,
    include: { user: { select: { id: true, name: true, displayName: true, avatarUrl: true } } },
  });
  return Response.json({ page, rows }, {
    headers: { "cache-control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
