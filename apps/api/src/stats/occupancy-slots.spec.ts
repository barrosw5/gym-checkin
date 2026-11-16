import { describe, expect, it } from 'vitest';
import { averageOccupancyBySlot, type SlotAverage } from './occupancy-slots.js';

const TZ = 'Europe/Lisbon';
const at = (iso: string) => new Date(iso);
const span = (entry: string, exit: string) => ({ entryAt: at(entry), exitAt: at(exit) });
const find = (result: SlotAverage[], weekday: number, slot: number) =>
  result.find((r) => r.weekday === weekday && r.slot === slot)?.average;

// January: Lisbon is UTC+0. 2026-01-05 is a Monday.
const MONDAY = at('2026-01-05T00:00:00Z');
const TUESDAY = at('2026-01-06T00:00:00Z');

describe('averageOccupancyBySlot', () => {
  it('counts a visit in every 15-minute interval it touches', () => {
    const result = averageOccupancyBySlot([span('2026-01-05T18:05:00Z', '2026-01-05T18:40:00Z')], MONDAY, TUESDAY, TZ);

    // 18:00, 18:15 and 18:30 are slots 72, 73 and 74
    expect([71, 72, 73, 74, 75].map((s) => find(result, 1, s))).toEqual([0, 1, 1, 1, 0]);
  });

  it('does not count a visit in the interval where it ends exactly', () => {
    const result = averageOccupancyBySlot([span('2026-01-05T18:00:00Z', '2026-01-05T18:15:00Z')], MONDAY, TUESDAY, TZ);

    expect(find(result, 1, 72)).toBe(1);
    expect(find(result, 1, 73)).toBe(0);
  });

  it('splits a visit across midnight between both days', () => {
    const result = averageOccupancyBySlot(
      [span('2026-01-04T23:50:00Z', '2026-01-05T00:20:00Z')],
      at('2026-01-04T00:00:00Z'), // Sunday
      TUESDAY,
      TZ,
    );

    expect(find(result, 7, 95)).toBe(1); // Sunday 23:45
    expect(find(result, 1, 0)).toBe(1); // Monday 00:00
    expect(find(result, 1, 1)).toBe(1); // Monday 00:15
    expect(find(result, 1, 2)).toBe(0);
  });

  it('averages over every occurrence of the weekday, empty ones included', () => {
    // Two Mondays in the window, people only on the first
    const result = averageOccupancyBySlot(
      [span('2026-01-05T18:00:00Z', '2026-01-05T18:15:00Z'), span('2026-01-05T18:00:00Z', '2026-01-05T18:10:00Z')],
      MONDAY,
      at('2026-01-19T00:00:00Z'),
      TZ,
    );

    expect(find(result, 1, 72)).toBe(1); // (2 + 0) / 2
  });

  it('only counts the part of a visit inside the window', () => {
    const result = averageOccupancyBySlot([span('2026-01-04T23:00:00Z', '2026-01-05T00:20:00Z')], MONDAY, TUESDAY, TZ);

    expect(find(result, 7, 92)).toBeUndefined(); // Sunday is outside the window
    expect(find(result, 1, 0)).toBe(1);
  });

  it('names the intervals in local time (summer: UTC+1)', () => {
    // 2026-07-06 is a Monday; 17:00 UTC is 18:00 in Lisbon
    const result = averageOccupancyBySlot(
      [span('2026-07-06T17:00:00Z', '2026-07-06T17:15:00Z')],
      at('2026-07-05T23:00:00Z'),
      at('2026-07-06T23:00:00Z'),
      TZ,
    );

    expect(find(result, 1, 72)).toBe(1);
    expect(find(result, 1, 68)).toBe(0);
  });

  it('skips the hour that does not exist when the clocks go forward', () => {
    // 2026-03-29 (Sunday): 01:00 jumps to 02:00, so the local day has 23 hours
    const result = averageOccupancyBySlot([], at('2026-03-29T00:00:00Z'), at('2026-03-29T23:00:00Z'), TZ);

    expect(result).toHaveLength(92);
    expect(find(result, 7, 4)).toBeUndefined(); // 01:00 never happened
    expect(find(result, 7, 8)).toBe(0); // 02:00 did
  });

  it('returns nothing for an empty window', () => {
    expect(averageOccupancyBySlot([], MONDAY, MONDAY, TZ)).toEqual([]);
  });
});
