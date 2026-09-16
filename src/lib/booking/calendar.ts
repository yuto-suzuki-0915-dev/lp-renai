const jstDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getJstDateKey(date = new Date()) {
  const parts = jstDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) throw new Error("日本時間の日付を取得できませんでした。");
  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getWeekdayFromDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay();
}

export function getMondayDateKey(dateKey: string) {
  const weekday = getWeekdayFromDateKey(dateKey);
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  return addDaysToDateKey(dateKey, -daysFromMonday);
}

export function dateKeyToJstIso(dateKey: string, hour = 0) {
  const paddedHour = String(hour).padStart(2, "0");
  return new Date(`${dateKey}T${paddedHour}:00:00+09:00`).toISOString();
}
