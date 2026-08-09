export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function normalizeTimeZone(timeZone: string | null | undefined) {
  return timeZone && isValidTimeZone(timeZone) ? timeZone : "UTC";
}

export function zonedDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: normalizeTimeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

export function zonedDateKey(date: Date, timeZone: string) {
  const parts = zonedDateParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function offsetAt(date: Date, timeZone: string) {
  const parts = zonedDateParts(date, timeZone);
  const representedAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return representedAsUtc - Math.floor(date.getTime() / 1_000) * 1_000;
}

export function startOfZonedDay(date: Date, timeZone: string) {
  const zone = normalizeTimeZone(timeZone);
  const parts = zonedDateParts(date, zone);
  const localMidnightAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day);
  let result = new Date(localMidnightAsUtc - offsetAt(new Date(localMidnightAsUtc), zone));
  result = new Date(localMidnightAsUtc - offsetAt(result, zone));
  return result;
}

export function previousZonedDayStart(date: Date, timeZone: string) {
  return startOfZonedDay(new Date(startOfZonedDay(date, timeZone).getTime() - 12 * 60 * 60 * 1_000), timeZone);
}

export function endOfZonedDay(date: Date, timeZone: string) {
  const tomorrow = new Date(startOfZonedDay(date, timeZone).getTime() + 36 * 60 * 60 * 1_000);
  return new Date(startOfZonedDay(tomorrow, timeZone).getTime() - 1);
}
