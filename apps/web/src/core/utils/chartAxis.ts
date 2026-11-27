import type { ChartRow } from "../types/stats";

const DAY_MINUTES = 24 * 60;
const TICK_MINUTES = 3 * 60;

/**
 * The part of the day worth drawing: from the first to the last minute with
 * anyone inside, widened to whole 3-hour ticks. A gym is empty all night, and
 * a third of a phone screen should not show that. No activity: the whole day.
 */
export function chartAxis(rows: ChartRow[]): { domain: [number, number]; ticks: number[] } {
  const busy = rows.filter((r) => (r.today ?? 0) > 0 || (r.typical ?? 0) > 0).map((r) => r.minute);
  const start = busy.length ? Math.floor(busy[0] / TICK_MINUTES) * TICK_MINUTES : 0;
  const end = busy.length ? Math.ceil(busy[busy.length - 1] / TICK_MINUTES) * TICK_MINUTES : DAY_MINUTES;
  const ticks = [];
  for (let minute = start; minute <= end; minute += TICK_MINUTES) ticks.push(minute);
  return { domain: [start, end], ticks };
}
