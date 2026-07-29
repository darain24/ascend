import { db } from "@/lib/db";
import { authErrorResponse, requestUserId } from "@/lib/auth/request-user";

export async function POST(request: Request) {
  try {
    const userId = requestUserId(request);
    const { itemId } = (await request.json()) as { itemId?: string };
    if (!itemId) return Response.json({ error: "itemId is required" }, { status: 400 });
    const result = await db.$transaction(async (tx) => {
      const owned = await tx.userItem.findUnique({
        where: { userId_itemId: { userId, itemId } },
        include: { item: true },
      });
      if (!owned) throw new Error("Item is not owned.");
      const sameType = await tx.userItem.findMany({
        where: { userId, equipped: true, item: { type: owned.item.type } },
      });
      await tx.userItem.updateMany({
        where: { userId, itemId: { in: sameType.map((entry) => entry.itemId) } },
        data: { equipped: false },
      });
      return tx.userItem.update({
        where: { userId_itemId: { userId, itemId } },
        data: { equipped: true },
        include: { item: true },
      });
    });
    return Response.json({ equipped: result });
  } catch (error) {
    return authErrorResponse(error) ?? Response.json({ error: error instanceof Error ? error.message : "Equip failed" }, { status: 409 });
  }
}
