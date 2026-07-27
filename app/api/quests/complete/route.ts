import { applyXp } from "@/lib/game-logic/engine";
import { initialHunter } from "@/lib/demo-data";
import type { HunterState } from "@/types/game";
import type { StatKey } from "@/lib/game-logic/constants";

const QUEST_REWARDS: Record<string, { xp: number; stat: StatKey }> = {
  "q-workout": { xp: 100, stat: "STR" },
  "q-read": { xp: 60, stat: "INT" },
  "q-sleep": { xp: 60, stat: "VIT" },
  "q-walk": { xp: 35, stat: "AGI" },
  "q-journal": { xp: 35, stat: "PER" },
};

const completed = new Set<string>();
let authoritativeHunter: HunterState = structuredClone(initialHunter);

export async function POST(request: Request) {
  const payload = (await request.json()) as { questId?: string };
  const questId = payload.questId?.trim();
  if (!questId) return Response.json({ error: "questId is required" }, { status: 400 });

  if (completed.has(questId)) {
    return Response.json({ error: "Quest already completed" }, { status: 409 });
  }

  const reward = QUEST_REWARDS[questId] ?? (questId.startsWith("q-") ? { xp: 60, stat: "PER" as const } : null);
  if (!reward) return Response.json({ error: "Unknown quest" }, { status: 404 });

  const progression = applyXp(authoritativeHunter.level, authoritativeHunter.xp, reward.xp);
  authoritativeHunter = {
    ...authoritativeHunter,
    level: progression.level,
    xp: progression.currentXp,
    xpToNext: progression.xpToNextLevel,
    rank: progression.rank,
    totalCompleted: authoritativeHunter.totalCompleted + 1,
    totalXp: authoritativeHunter.totalXp + reward.xp,
    discipline: Math.min(100, authoritativeHunter.discipline + 1),
    stats: {
      ...authoritativeHunter.stats,
      [reward.stat]: authoritativeHunter.stats[reward.stat] + 1,
    },
  };
  completed.add(questId);

  return Response.json({
    hunter: authoritativeHunter,
    xpAwarded: reward.xp,
    leveledUp: progression.leveledUp,
    rankedUp: progression.rankedUp,
  });
}
