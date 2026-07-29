import { db } from "@/lib/db";
import { localEmbedding } from "@/lib/ai/embeddings";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function GET(request: Request) {
  try {
    const userId = requestUserId(request);
    const entries = await db.journalEntry.findMany({
      where: { userId },
      select: { id: true, content: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return Response.json({ entries });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Journal could not be loaded" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = requestUserId(request);
    const { content } = (await request.json()) as { content?: string };
    const cleanContent = content?.trim();
    if (!cleanContent || cleanContent.length > 5000) {
      return Response.json({ error: "Entry must be between 1 and 5,000 characters." }, { status: 400 });
    }
    const entry = await db.journalEntry.create({ data: { userId, content: cleanContent } });
    const vector = `[${localEmbedding(cleanContent).join(",")}]`;
    await db.$executeRawUnsafe(
      `UPDATE "JournalEntry" SET "embedding" = $1::vector WHERE "id" = $2`,
      vector,
      entry.id,
    );
    return Response.json({ entry: { id: entry.id, content: entry.content, createdAt: entry.createdAt } }, { status: 201 });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: "Journal entry could not be saved" }, { status: 500 });
  }
}
