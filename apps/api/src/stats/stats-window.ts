import type { StatsRange } from '@gym-checkin/shared';
import { SLOT_MINUTES } from './occupancy-slots.js';

/** Days covered by each range, today included. */
const DAYS: Record<StatsRange, number> = { today: 1, week: 7, month: 30, quarter: 90 };

const SLOT_MS = SLOT_MINUTES * 60_000;

/** The UTC offset of a time zone at an instant, in ms (Lisbon: 0 or +1 h). */
function offsetAt(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  // Drop seconds/ms of the instant: the formatted parts stop at minutes
  return asUtc - (instant - (instant % 60_000));
}

/**
 * The period of a range: from local midnight (N - 1 days before today) to
 * now, floored to a 15-minute boundary so the intervals line up.
 *
 * Midnight is found with Intl (no date library): take today's local date,
 * go back N - 1 calendar days, then subtract that day's UTC offset. Working
 * on calendar dates, not "now - N × 24 h", keeps the daylight saving days
 * (23 or 25 hours long) right.
 */
export function statsWindow(range: StatsRange, now: Date, timeZone: string): { from: Date; to: Date } {
  const nowMs = now.getTime();
  const today = new Date(nowMs + offsetAt(nowMs, timeZone)); // local wall clock, read with getUTC*
  const firstDay = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (DAYS[range] - 1));
  // Lisbon changes clocks at 01:00/02:00, so midnight itself always exists
  const from = firstDay - offsetAt(firstDay, timeZone);
  const to = nowMs - (nowMs % SLOT_MS);
  return { from: new Date(from), to: new Date(to) };
}
