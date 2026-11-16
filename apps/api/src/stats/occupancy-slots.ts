/** Length of one statistics interval. */
export const SLOT_MINUTES = 15;
const SLOT_MS = SLOT_MINUTES * 60_000;
/** Intervals in one day (96 of 15 minutes). */
export const SLOTS_PER_DAY = (24 * 60) / SLOT_MINUTES;

/** A finished gym visit: only the times, never who (GDPR). */
export interface SessionSpan {
  entryAt: Date;
  exitAt: Date;
}

/** Average people in the gym during one interval of one weekday. */
export interface SlotAverage {
  /** ISO weekday: 1 = Monday ... 7 = Sunday. */
  weekday: number;
  /** Interval of the day: 0 = 00:00-00:15 ... 95 = 23:45-24:00 (local time). */
  slot: number;
  average: number;
}

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/**
 * Average occupancy per weekday and 15-minute interval, between `from` and
 * `to` (UTC instants; `from` must fall on a 15-minute boundary).
 *
 * Time-weighted: a visit counts by the share of the interval it covers, so
 * leaving at 18:01 adds 1/15 to the 18:00 interval, not a whole person. The
 * result is the average number of people inside during the interval.
 *
 * The intervals are walked in UTC and only then named in local time, so the
 * daylight saving changes need no special case: on the spring day 01:00 to
 * 01:59 simply does not occur, on the autumn day it occurs twice. Portugal's
 * offsets are whole hours, so UTC and local 15-minute boundaries coincide.
 */
export function averageOccupancyBySlot(
  sessions: SessionSpan[],
  from: Date,
  to: Date,
  timeZone: string,
): SlotAverage[] {
  const start = from.getTime();
  const total = Math.floor((to.getTime() - start) / SLOT_MS);
  if (total <= 0) return [];

  // Average people per interval of the window
  const people = Array.from({ length: total }, () => 0);
  for (const { entryAt, exitAt } of sessions) {
    const entry = entryAt.getTime();
    const exit = exitAt.getTime();
    const first = Math.max(0, Math.floor((entry - start) / SLOT_MS));
    // ceil - 1: leaving exactly at 18:15 does not touch the 18:15 interval
    const last = Math.min(total - 1, Math.ceil((exit - start) / SLOT_MS) - 1);
    for (let i = first; i <= last; i++) {
      const slotStart = start + i * SLOT_MS;
      const inside = Math.min(exit, slotStart + SLOT_MS) - Math.max(entry, slotStart);
      people[i] += inside / SLOT_MS;
    }
  }

  // One formatter for the whole loop: creating it is the expensive part
  const local = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  // Sum and number of occurrences per (weekday, slot): the average divides
  // by how many Mondays 18:00 the window had, including the empty ones
  const sums = new Map<number, { sum: number; times: number }>();
  for (let i = 0; i < total; i++) {
    const parts = local.formatToParts(new Date(start + i * SLOT_MS));
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const weekday = WEEKDAYS[get('weekday')];
    const slot = (Number(get('hour')) * 60 + Number(get('minute'))) / SLOT_MINUTES;
    const key = weekday * SLOTS_PER_DAY + slot;
    const entry = sums.get(key) ?? { sum: 0, times: 0 };
    entry.sum += people[i];
    entry.times++;
    sums.set(key, entry);
  }

  return [...sums.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, { sum, times }]) => ({
      weekday: Math.floor(key / SLOTS_PER_DAY),
      slot: key % SLOTS_PER_DAY,
      average: sum / times,
    }));
}
