// Pure presentation helpers: no state, no API. Components may import them
// directly (unlike services, which they only reach through their hook).

// Created once and reused: building an Intl formatter is relatively costly
const time = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" });
const timeWithSeconds = new Intl.DateTimeFormat("pt-PT", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** "18:05" */
export const formatTime = (date: Date): string => time.format(date);

/** "18:05:42": when seconds matter (e.g. the order requests came in). */
export const formatTimeWithSeconds = (date: Date): string => timeWithSeconds.format(date);

/** "YYYY-MM-DDTHH:mm" in local time: the format of <input type="datetime-local">. */
export const toLocalInput = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};
