import { describe, expect, it } from "vitest";
import type { Stats } from "../types/stats";
import { statsHighlights } from "./statsHighlights";

const stats: Stats = {
  range: "month",
  chart: [],
  peakToday: { count: 7, minute: 1185 },
  peakTypical: { hour: 19, average: 4.6 },
  heatmap: [],
  duration: { visits: 1036, averageMinutes: 76, medianMinutes: 74 },
  best: [
    { hour: 15, average: 1.2 },
    { hour: 22, average: 0.8 },
  ],
  todayWeekday: 4,
  hasVisits: true,
};

const values = (s: Stats) => statsHighlights(s, "pt-PT").map((h) => h.value);

describe("statsHighlights", () => {
  it("shows visits, duration, busiest and calmest hour for a period", () => {
    expect(values(stats)).toEqual([
      expect.stringMatching(/1.?036/),
      { key: "stats.duration.minutes", params: { value: 76 } },
      { key: "stats.best.hour", params: { hour: 19 } },
      { key: "stats.best.hour", params: { hour: 22 } },
    ]);
  });

  it("shows today's own peak instead when the range is today", () => {
    expect(values({ ...stats, range: "today" }).slice(2)).toEqual(["19:45", "7"]);
  });

  it("leaves a figure empty when there is no data for it", () => {
    const empty: Stats = {
      ...stats,
      duration: { visits: 0, averageMinutes: null, medianMinutes: null },
      peakTypical: null,
      best: [],
    };

    expect(values(empty)).toEqual(["0", null, null, null]);
  });
});
