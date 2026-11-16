import type { StatsSummary } from "@gym-checkin/shared";
import { describe, expect, it } from "vitest";
import { toStats } from "./statsService";

// Wednesday 7 January 2026, 18:30 in Lisbon (UTC+0 in winter: local = UTC)
const NOW = new Date("2026-01-07T18:30:00Z");
const MINUTE = (hh: number, mm = 0) => hh * 60 + mm;

const summary = (overrides: Partial<StatsSummary> = {}): StatsSummary => ({
  range: "month",
  from: "2025-12-09T00:00:00.000Z",
  to: "2026-01-07T18:30:00.000Z",
  typicalDay: Array.from({ length: 96 }, () => 0),
  heatmap: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)),
  duration: { visits: 0, averageMinutes: null, medianMinutes: null },
  today: [
    { at: "2026-01-07T00:00:00.000Z", count: 0 },
    { at: "2026-01-07T18:30:00.000Z", count: 0 },
  ],
  ...overrides,
});

/** A heatmap with some hours of one weekday set (0 = Monday). */
const heatmapWith = (day: number, hours: Record<number, number | null>) =>
  Array.from({ length: 7 }, (_, d) =>
    Array.from({ length: 24 }, (_, h) => (d === day && h in hours ? hours[h] : 0)),
  );

describe("toStats: today's line", () => {
  const stats = toStats(
    summary({
      today: [
        { at: "2026-01-07T00:00:00.000Z", count: 0 },
        { at: "2026-01-07T18:02:00.000Z", count: 2 },
        { at: "2026-01-07T18:30:00.000Z", count: 2 },
      ],
    }),
    NOW,
  );
  const at = (minute: number) => stats.chart[minute];

  it("has one row per minute of the day, 00:00 to 24:00", () => {
    expect(stats.chart).toHaveLength(1441);
    expect(stats.chart[1440].minute).toBe(1440);
  });

  it("steps exactly at the entry, not before", () => {
    expect(at(MINUTE(18, 1)).today).toBe(0);
    expect(at(MINUTE(18, 2)).today).toBe(2);
  });

  it("stops at now: the rest of the day has no line", () => {
    expect(at(MINUTE(18, 30)).today).toBe(2);
    expect(at(MINUTE(18, 31)).today).toBeNull();
  });

  it("knows the busiest moment of today", () => {
    expect(stats.peakToday).toEqual({ count: 2, minute: MINUTE(18, 2) });
  });
});

describe("toStats: typical day", () => {
  const typicalDay = Array.from({ length: 96 }, () => 0 as number | null);
  typicalDay[72] = 2; // 18:00-18:15, drawn at 18:07:30
  typicalDay[73] = 4; // 18:15-18:30, drawn at 18:22:30
  typicalDay[80] = null; // 20:00-20:15: no data
  const stats = toStats(summary({ typicalDay }), NOW);

  it("draws a straight line between the middles of the 15-minute averages", () => {
    // 18:15 is halfway between 18:07:30 (2) and 18:22:30 (4)
    expect(stats.chart[MINUTE(18, 15)].typical).toBe(3);
  });

  it("leaves a gap where there is no data, instead of drawing zero", () => {
    expect(stats.chart[MINUTE(20, 5)].typical).toBeNull();
    expect(stats.chart[MINUTE(19, 0)].typical).toBe(0);
  });

  it("finds the busiest hour of the typical day", () => {
    // 18h: (2 + 4 + 0 + 0) / 4
    expect(stats.peakTypical).toEqual({ hour: 18, average: 1.5 });
  });
});

describe("toStats: best time to go", () => {
  it("picks the two quietest hours still ahead today, in time order", () => {
    // Wednesday (2); now is 18:30, so 18h is already under way
    const heatmap = heatmapWith(2, { 18: 0.1, 19: 1, 20: 0.5, 21: 0.5, 22: 2 });
    // Other days use the gym at 20-22h too, so those hours count as "in use"
    heatmap[0][20] = heatmap[0][21] = heatmap[0][22] = heatmap[0][19] = 1;

    expect(toStats(summary({ heatmap }), NOW).best).toEqual([
      { hour: 20, average: 0.5 },
      { hour: 21, average: 0.5 },
    ]);
  });

  it("ignores hours when nobody ever goes (03:00 must not 'win')", () => {
    const heatmap = heatmapWith(2, { 19: 1.5, 23: 0 });
    heatmap[0][19] = 1;

    // 23h is 0 on every day: the gym is not used then, so it is not a suggestion
    expect(toStats(summary({ heatmap }), NOW).best).toEqual([{ hour: 19, average: 1.5 }]);
  });

  it("suggests nothing when there is no history for the rest of today", () => {
    expect(toStats(summary(), NOW).best).toEqual([]);
  });

  it("uses today's row of the heatmap (Wednesday)", () => {
    expect(toStats(summary(), NOW).todayWeekday).toBe(2);
  });
});

describe("toStats: empty period", () => {
  it("says there were no visits, so the page can show an empty state", () => {
    const stats = toStats(summary(), NOW);

    expect(stats.hasVisits).toBe(false);
    expect(stats.peakToday).toBeNull();
    expect(stats.peakTypical).toBeNull();
  });
});
