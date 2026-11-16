// Pure presentation helpers: no state, no API. Components may import them
// directly (unlike services, which they only reach through their hook).

// One formatter per (language, options), created once and reused: building
// an Intl formatter is relatively costly and these run on every render
const cache = new Map<string, Intl.DateTimeFormat>();
const formatter = (languageTag: string, withSeconds: boolean) => {
  const id = `${languageTag}|${withSeconds}`;
  let f = cache.get(id);
  if (!f) {
    f = new Intl.DateTimeFormat(languageTag, {
      hour: "2-digit",
      minute: "2-digit",
      ...(withSeconds && { second: "2-digit" }),
      // 24 h in every language: a gym timetable, not a 9-to-5 clock
      hourCycle: "h23",
    });
    cache.set(id, f);
  }
  return f;
};

/** "18:05". languageTag comes from useTranslation() (e.g. "pt-PT"). */
export const formatTime = (date: Date, languageTag: string): string =>
  formatter(languageTag, false).format(date);

/** "18:05:42": when seconds matter (e.g. the order requests came in). */
export const formatTimeWithSeconds = (date: Date, languageTag: string): string =>
  formatter(languageTag, true).format(date);

/** "YYYY-MM-DDTHH:mm" in local time: the format of <input type="datetime-local">. */
export const toLocalInput = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

/** "1,4" / "1.4": averages with one decimal at most, in the active language. */
export const formatNumber = (value: number, languageTag: string): string =>
  new Intl.NumberFormat(languageTag, { maximumFractionDigits: 1 }).format(value);

/** Short weekday name, 0 = Monday ("seg."/"Mon"), from Intl: no list to translate. */
export const formatWeekday = (index: number, languageTag: string): string =>
  // 1 January 2024 was a Monday; UTC so the date never shifts
  new Intl.DateTimeFormat(languageTag, { weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, 0, 1 + index)),
  );

/** "18:00" for a minute of the day (chart axes and tooltips). */
export const formatMinute = (minute: number): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(minute / 60) % 24)}:${pad(Math.round(minute % 60))}`;
};
