import { applyXp } from "@/lib/game-logic/engine";
import type { HunterState } from "@/types/game";
import { STAT_KEYS, type StatKey } from "@/lib/game-logic/constants";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    questId?: string;
    snapshot?: HunterState;
    reward?: { xp?: number; stat?: StatKey };
  };
  const questId = payload.questId?.trim();
  if (!questId) return Response.json({ error: "questId is required" }, { status: 400 });
  const snapshot = payload.snapshot;
  const xp = payload.reward?.xp;
  const stat = payload.reward?.stat;
  if (
    !snapshot ||
    typeof xp !== "number" ||
    !Number.isFinite(xp) ||
    xp < 1 ||
    xp > 500 ||
    !stat ||
    !STAT_KEYS.includes(stat)
  ) {
    return Response.json({ error: "Valid quest progress is required" }, { status: 400 });
  }

  const progression = applyXp(snapshot.level, snapshot.xp, xp);
  const hunter: HunterState = {
    ...snapshot,
    level: progression.level,
    xp: progression.currentXp,
    xpToNext: progression.xpToNextLevel,
    rank: progression.rank,
    totalCompleted: snapshot.totalCompleted + 1,
    totalXp: snapshot.totalXp + xp,
    discipline: Math.min(100, snapshot.discipline + 1),
    stats: {
      ...snapshot.stats,
      [stat]: snapshot.stats[stat] + 1,
    },
  };

  return Response.json({
    hunter,
    xpAwarded: xp,
    leveledUp: progression.leveledUp,
    rankedUp: progression.rankedUp,
  });
}
