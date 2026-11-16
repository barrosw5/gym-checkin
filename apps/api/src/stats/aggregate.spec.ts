import { describe, expect, it } from 'vitest';
import { heatmap, typicalDay, visitDuration } from './aggregate.js';
import type { SlotAverage } from './occupancy-slots.js';

const slot = (weekday: number, slotOfDay: number, average: number, times = 1): SlotAverage => ({
  weekday,
  slot: slotOfDay,
  average,
  times,
});
const visit = (minutes: number) => ({
  entryAt: new Date('2026-01-05T18:00:00Z'),
  exitAt: new Date(Date.parse('2026-01-05T18:00:00Z') + minutes * 60_000),
});

describe('typicalDay', () => {
  it('folds the weekdays into one day, weighted by how often each occurred', () => {
    // 18:00 on 5 Mondays averaged 2 people, on 4 Sundays 0.5
    const day = typicalDay([slot(1, 72, 2, 5), slot(7, 72, 0.5, 4)]);

    expect(day).toHaveLength(96);
    expect(day[72]).toBeCloseTo((2 * 5 + 0.5 * 4) / 9);
  });

  it('keeps "no data" (null) apart from "empty gym" (0)', () => {
    const day = typicalDay([slot(1, 0, 0)]);

    expect(day[0]).toBe(0);
    expect(day[1]).toBeNull();
  });
});

describe('heatmap', () => {
  it('has 7 rows of 24 hours, Monday first', () => {
    const map = heatmap([slot(1, 72, 1), slot(7, 0, 3)]);

    expect(map).toHaveLength(7);
    expect(map.every((row) => row.length === 24)).toBe(true);
    expect(map[0][18]).toBe(1); // Monday 18h
    expect(map[6][0]).toBe(3); // Sunday 0h
  });

  it('averages the four 15-minute intervals of an hour', () => {
    const map = heatmap([slot(2, 72, 4), slot(2, 73, 0), slot(2, 74, 0), slot(2, 75, 0)]);

    expect(map[1][18]).toBe(1);
    expect(map[1][19]).toBeNull();
  });
});

describe('visitDuration', () => {
  it('returns nulls when there were no visits', () => {
    expect(visitDuration([])).toEqual({ visits: 0, averageMinutes: null, medianMinutes: null });
  });

  it('uses the middle visit as the median, so one long visit does not pull it up', () => {
    expect(visitDuration([visit(30), visit(40), visit(240)])).toEqual({
      visits: 3,
      averageMinutes: 103,
      medianMinutes: 40,
    });
  });

  it('takes the mean of the two middle visits for an even count', () => {
    expect(visitDuration([visit(30), visit(50), visit(40), visit(60)]).medianMinutes).toBe(45);
  });
});
