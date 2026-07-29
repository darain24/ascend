"use client";

import { useMemo } from "react";
import {
  buildActivityDays,
  type ActivityHistory,
} from "@/lib/activity";

const intensityColors = [
  "var(--line)",
  "rgba(61, 155, 114, 0.24)",
  "rgba(61, 155, 114, 0.44)",
  "rgba(61, 155, 114, 0.68)",
  "rgba(61, 155, 114, 0.92)",
];

export function ActivityHeatmap({
  activity,
  compact = false,
}: {
  activity: ActivityHistory;
  compact?: boolean;
}) {
  const days = useMemo(() => buildActivityDays(activity), [activity]);
  const formatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }),
    [],
  );

  return (
    <div>
      <div className={`grid grid-flow-col grid-rows-7 ${compact ? "gap-1" : "gap-1.5"}`}>
        {days.map((day) => {
          const activityText = day.completed
            ? `${day.completed} ${day.completed === 1 ? "quest" : "quests"} · ${day.xp} XP`
            : "No activity";
          const label = `${formatter.format(day.date)}: ${activityText}`;
          return (
            <div
              key={day.dateKey}
              role="img"
              aria-label={label}
              title={label}
              className={`aspect-square rounded-[4px] outline-none transition hover:scale-110 hover:ring-2 hover:ring-emerald-600/25 focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                compact ? "min-h-2" : ""
              }`}
              style={{ background: intensityColors[day.intensity] }}
              tabIndex={0}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="mt-4 flex items-center justify-end gap-1.5 text-[9px] text-[var(--muted)]">
          <span className="mr-1">Less</span>
          {intensityColors.map((color, index) => (
            <span
              key={color}
              className="size-3 rounded-[3px]"
              style={{ background: color }}
              aria-label={`${index} activity intensity`}
            />
          ))}
          <span className="ml-1">More</span>
        </div>
      )}
    </div>
  );
}
