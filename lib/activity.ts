import type { StatKey } from "./game-logic/constants";

export type DailyActivity = {
  completed: number;
  xp: number;
  stats?: Partial<Record<StatKey, number>>;
};

export type ActivityHistory = Record<string, DailyActivity>;

export type ActivityDay = DailyActivity & {
  date: Date;
  dateKey: string;
  intensity: 0 | 1 | 2 | 3 | 4;
};

export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addQuestCompletion(
  history: ActivityHistory,
  xp: number,
  completedAt = new Date(),
  stat?: StatKey,
): ActivityHistory {
  const dateKey = localDateKey(completedAt);
  const current = history[dateKey] ?? { completed: 0, xp: 0 };
  return {
    ...history,
    [dateKey]: {
      completed: current.completed + 1,
      xp: current.xp + Math.max(0, xp),
      ...(stat
        ? { stats: { ...current.stats, [stat]: (current.stats?.[stat] ?? 0) + 1 } }
        : {}),
    },
  };
}

export function activityIntensity(completed: number): 0 | 1 | 2 | 3 | 4 {
  if (completed <= 0) return 0;
  if (completed === 1) return 1;
  if (completed === 2) return 2;
  if (completed === 3) return 3;
  return 4;
}

export function buildActivityDays(
  history: ActivityHistory,
  count = 84,
  today = new Date(),
): ActivityDay[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index));
    const dateKey = localDateKey(date);
    const activity = history[dateKey] ?? { completed: 0, xp: 0 };
    return {
      date,
      dateKey,
      ...activity,
      intensity: activityIntensity(activity.completed),
    };
  });
}
