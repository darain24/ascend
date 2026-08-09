import { db } from "@/lib/db";
import { requestUserId, authErrorResponse } from "@/lib/auth/request-user";
import { isValidTimeZone } from "@/lib/timezone";

export async function PATCH(request: Request) {
  try {
    const userId = await requestUserId();
    const body = (await request.json()) as { name?: string; email?: string; avatarUrl?: string | null; githubUsername?: string; timezone?: string };
    const data: { name?: string; displayName?: string; email?: string; avatarUrl?: string | null; githubUsername?: string | null; timezone?: string } = {};
    if (body.name !== undefined) {
      const name = body.name.trim();
      if (name.length < 2 || name.length > 80) return Response.json({ error: "Enter a valid name." }, { status: 400 });
      data.name = name;
      data.displayName = name;
    }
    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Enter a valid email." }, { status: 400 });
      data.email = email;
    }
    if (body.avatarUrl !== undefined) {
      if (body.avatarUrl && (!body.avatarUrl.startsWith("data:image/") || body.avatarUrl.length > 2_800_000)) {
        return Response.json({ error: "Avatar must be a JPG, PNG, or WebP under 2 MB." }, { status: 400 });
      }
      data.avatarUrl = body.avatarUrl;
    }
    if (body.githubUsername !== undefined) {
      const githubUsername = body.githubUsername.trim().replace(/^@/, "");
      if (githubUsername && !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(githubUsername)) {
        return Response.json({ error: "Enter a valid GitHub username." }, { status: 400 });
      }
      data.githubUsername = githubUsername || null;
    }
    if (body.timezone !== undefined) {
      if (!isValidTimeZone(body.timezone)) return Response.json({ error: "Choose a valid timezone." }, { status: 400 });
      data.timezone = body.timezone;
    }
    const user = await db.user.update({
      where: { id: userId },
      data,
      select: { name: true, displayName: true, email: true, avatarUrl: true, githubUsername: true, timezone: true },
    });
    return Response.json({
      profile: { name: user.displayName || user.name || "Hunter", email: user.email || "", avatarUrl: user.avatarUrl, githubUsername: user.githubUsername || "", timezone: user.timezone },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return Response.json({ error: "That email address is already in use." }, { status: 409 });
    }
    return authErrorResponse(error) ?? Response.json({ error: "Profile could not be updated." }, { status: 500 });
  }
}
