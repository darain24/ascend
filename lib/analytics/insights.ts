export type DailyStatActivity = {
  date: string;
  stats: string[];
};

export function correlationInsight(
  days: DailyStatActivity[],
  primary: string,
  companion: string,
) {
  const withCompanion = days.filter((day) => day.stats.includes(companion));
  const withoutCompanion = days.filter((day) => !day.stats.includes(companion));
  const completionRate = (group: DailyStatActivity[]) =>
    group.length
      ? group.filter((day) => day.stats.includes(primary)).length / group.length
      : 0;
  const withRate = completionRate(withCompanion);
  const withoutRate = completionRate(withoutCompanion);
  const lift = withoutRate > 0 ? ((withRate - withoutRate) / withoutRate) * 100 : withRate * 100;
  return {
    primary,
    companion,
    withRate,
    withoutRate,
    liftPercent: Math.round(lift),
    sampleSize: days.length,
  };
}

export function estimateDaysToTarget(
  dailyXp: number[],
  currentXp: number,
  targetXp: number,
) {
  const remaining = Math.max(0, targetXp - currentXp);
  if (remaining === 0) return 0;
  const recent = dailyXp.slice(-14);
  if (!recent.length) return null;
  const weightedTotal = recent.reduce(
    (total, xp, index) => total + Math.max(0, xp) * (index + 1),
    0,
  );
  const weight = recent.reduce((total, _, index) => total + index + 1, 0);
  const pace = weightedTotal / weight;
  if (pace <= 0) return null;
  return Math.ceil(remaining / pace);
}
