import { RESIDENCE_TIME_ZONE, type StatsRange, type StatsSummary } from "@gym-checkin/shared";
import { statsApi } from "../api/statsApi";
import type { BestHour, ChartRow, Stats } from "../types/stats";

const SLOT_MINUTES = 15;
const DAY_MINUTES = 24 * 60;
const WEEKDAYS: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

// The residence's clock, not the browser's: a student abroad still sees
// "18:00" as 18:00 in Lisbon, where the gym is
const clock = new Intl.DateTimeFormat("en-GB", {
  timeZone: RESIDENCE_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function localTime(date: Date): { weekday: number; minute: number } {
  const parts = clock.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { weekday: WEEKDAYS[get("weekday")], minute: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** Typical day at any minute: a straight line between the middles of the 15-minute averages. */
function typicalAt(typicalDay: (number | null)[], minute: number): number | null {
  const position = (minute - SLOT_MINUTES / 2) / SLOT_MINUTES;
  const before = Math.max(0, Math.floor(position));
  const after = Math.min(typicalDay.length - 1, Math.ceil(position));
  const a = typicalDay[before];
  const b = typicalDay[after];
  if (a === null || b === null || a === undefined || b === undefined) return null;
  const share = Math.min(1, Math.max(0, position - before));
  return a + (b - a) * share;
}

/** The chart, one row per minute: both lines share rows, so one tooltip shows both. */
function chartRows(summary: StatsSummary, nowMinute: number): ChartRow[] {
  // Today's steps as (minute, count), already in time order
  const steps = summary.today.map((p) => ({ minute: localTime(new Date(p.at)).minute, count: p.count }));
  let step = 0;
  return Array.from({ length: DAY_MINUTES + 1 }, (_, minute) => {
    while (step + 1 < steps.length && steps[step + 1].minute <= minute) step++;
    return {
      minute,
      today: minute <= nowMinute && steps.length > 0 ? steps[step].count : null,
      typical: typicalAt(summary.typicalDay, minute),
    };
  });
}

/**
 * The two quietest hours still ahead today, from this weekday's history.
 * Only hours when the gym is used at all count: otherwise 03:00 (always
 * empty) would always "win". Ties go to the earlier hour.
 */
function bestHours(heatmap: (number | null)[][], weekday: number, minute: number): BestHour[] {
  const used = (hour: number) => heatmap.some((day) => (day[hour] ?? 0) > 0);
  const nextHour = Math.floor(minute / 60) + 1;
  return heatmap[weekday]
    .map((average, hour) => ({ hour, average }))
    .filter((h): h is BestHour => h.hour >= nextHour && h.average !== null && used(h.hour))
    .sort((a, b) => a.average - b.average || a.hour - b.hour)
    .slice(0, 2)
    .sort((a, b) => a.hour - b.hour);
}

function peakTypical(typicalDay: (number | null)[]): Stats["peakTypical"] {
  let peak: Stats["peakTypical"] = null;
  for (let hour = 0; hour < 24; hour++) {
    const values = typicalDay.slice(hour * 4, hour * 4 + 4).filter((v): v is number => v !== null);
    if (values.length === 0) continue;
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    if (average > 0 && (!peak || average > peak.average)) peak = { hour, average };
  }
  return peak;
}

export function toStats(summary: StatsSummary, now: Date): Stats {
  const { weekday, minute } = localTime(now);
  const peak = summary.today.reduce<StatsSummary["today"][number] | null>(
    (best, p) => (p.count > (best?.count ?? 0) ? p : best),
    null,
  );

  return {
    range: summary.range,
    chart: chartRows(summary, minute),
    peakToday: peak ? { count: peak.count, minute: localTime(new Date(peak.at)).minute } : null,
    peakTypical: peakTypical(summary.typicalDay),
    heatmap: summary.heatmap,
    duration: summary.duration,
    best: bestHours(summary.heatmap, weekday, minute),
    todayWeekday: weekday,
    hasVisits: summary.typicalDay.some((v) => (v ?? 0) > 0) || peak !== null,
  };
}

export const statsService = {
  load: async (range: StatsRange, now = new Date()): Promise<Stats> => toStats(await statsApi.summary(range), now),
};
