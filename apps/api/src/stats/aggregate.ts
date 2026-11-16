import type { VisitDuration } from '@gym-checkin/shared';
import { SLOTS_PER_DAY, type SessionSpan, type SlotAverage } from './occupancy-slots.js';

const SLOTS_PER_HOUR = SLOTS_PER_DAY / 24;

/** Weighted mean: each average counts as many times as its interval occurred. */
function weightedMean(slots: SlotAverage[]): number | null {
  const times = slots.reduce((n, s) => n + s.times, 0);
  return times === 0 ? null : slots.reduce((sum, s) => sum + s.average * s.times, 0) / times;
}

/**
 * Typical day: every weekday folded into one day, 96 intervals. Weighted by
 * occurrences, so a period with 5 Mondays and 4 Sundays stays fair.
 */
export function typicalDay(slots: SlotAverage[]): (number | null)[] {
  return Array.from({ length: SLOTS_PER_DAY }, (_, slot) => weightedMean(slots.filter((s) => s.slot === slot)));
}

/** Heatmap: 7 weekdays (Monday first) × 24 hours, each hour the mean of its 4 intervals. */
export function heatmap(slots: SlotAverage[]): (number | null)[][] {
  return Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) =>
      weightedMean(
        slots.filter((s) => s.weekday === day + 1 && Math.floor(s.slot / SLOTS_PER_HOUR) === hour),
      ),
    ),
  );
}

/** Average and median length of finished visits, in whole minutes. */
export function visitDuration(visits: SessionSpan[]): VisitDuration {
  if (visits.length === 0) return { visits: 0, averageMinutes: null, medianMinutes: null };

  const minutes = visits
    .map((v) => (v.exitAt.getTime() - v.entryAt.getTime()) / 60_000)
    .sort((a, b) => a - b);
  const middle = Math.floor(minutes.length / 2);
  // Even count: the mean of the two middle visits
  const median = minutes.length % 2 ? minutes[middle] : (minutes[middle - 1] + minutes[middle]) / 2;
  const average = minutes.reduce((a, b) => a + b, 0) / minutes.length;

  return { visits: visits.length, averageMinutes: Math.round(average), medianMinutes: Math.round(median) };
}
