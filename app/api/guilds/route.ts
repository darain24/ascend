import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";
import { broadcastGuild } from "@/lib/realtime";

export async function GET(request: Request) {
  try {
    const userId = await requestUserId();
    const membership = await db.guildMember.findFirst({
      where: { userId },
      include: {
        guild: {
          include: {
            members: { include: { user: { include: { stats: true } } }, orderBy: { joinedAt: "asc" } },
            raidBosses: { where: { endsAt: { gt: new Date() } }, orderBy: { startsAt: "desc" }, take: 1 },
          },
        },
      },
    });
    return Response.json({ membership });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Guild could not be loaded" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requestUserId();
    const { name, icon = "shield" } = (await request.json()) as { name?: string; icon?: string };
    if (!name?.trim()) return Response.json({ error: "Guild name is required" }, { status: 400 });
    const guild = await db.$transaction(async (tx) => {
      const existing = await tx.guildMember.findFirst({ where: { userId } });
      if (existing) throw new Error("Leave your current guild before creating another.");
      const created = await tx.guild.create({
        data: { ownerId: userId, name: name.trim().slice(0, 60), icon, inviteCode: randomBytes(4).toString("hex").toUpperCase() },
      });
      await tx.guildMember.create({ data: { guildId: created.id, userId, role: "OWNER" } });
      return created;
    });
    await broadcastGuild(guild.id, "member-joined", { userId, role: "OWNER" });
    return Response.json({ guild }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: error instanceof Error ? error.message : "Guild creation failed" }, { status: 409 });
  }
}
