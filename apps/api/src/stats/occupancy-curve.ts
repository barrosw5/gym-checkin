import type { SessionSpan } from './occupancy-slots.js';

/** The occupancy from this instant on, until the next point. */
export interface CurvePoint {
  at: Date;
  count: number;
}

/**
 * Exact occupancy between `from` and `to` as a step line: one point at the
 * start, one at every entry or exit, one at the end. Only counts (GDPR).
 *
 * Built from +1/-1 events instead of sampling every minute: exact to the
 * millisecond, and the size follows the number of visits, not the period.
 */
export function occupancyCurve(sessions: SessionSpan[], from: Date, to: Date): CurvePoint[] {
  const start = from.getTime();
  const end = to.getTime();
  if (end <= start) return [];

  let inside = 0;
  // Net change per instant: two people entering at 18:00 is one +2 step
  const changes = new Map<number, number>();
  const add = (at: number, delta: number) => changes.set(at, (changes.get(at) ?? 0) + delta);

  for (const { entryAt, exitAt } of sessions) {
    const entry = entryAt.getTime();
    const exit = exitAt.getTime();
    if (exit <= start || entry >= end) continue; // outside the window
    if (entry <= start) inside++;
    else add(entry, +1);
    if (exit < end) add(exit, -1);
  }

  const points: CurvePoint[] = [{ at: from, count: inside }];
  for (const [at, delta] of [...changes.entries()].sort(([a], [b]) => a - b)) {
    // In and out at the same instant: no visible step
    if (delta === 0) continue;
    inside += delta;
    points.push({ at: new Date(at), count: inside });
  }
  points.push({ at: to, count: inside });
  return points;
}
