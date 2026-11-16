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
