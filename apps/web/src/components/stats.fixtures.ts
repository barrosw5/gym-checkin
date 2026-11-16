// Story data only: a believable residence gym, run through the real toStats
import type { StatsSummary } from "@gym-checkin/shared";
import { toStats } from "../core/services/statsService";

// Busy before classes (7-9h) and after them (18-21h), quiet otherwise
const busyness = (hour: number) =>
  hour >= 7 && hour < 9 ? 2.2 : hour >= 18 && hour < 21 ? 4.1 : hour >= 9 && hour < 23 ? 0.8 : 0;

const typicalDay = Array.from({ length: 96 }, (_, slot) => Math.round(busyness(Math.floor(slot / 4)) * 10) / 10);
// Weekends start later and are quieter
const heatmap = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => (day >= 5 ? (hour >= 10 ? busyness(hour) * 0.6 : 0) : busyness(hour))),
);

// Wednesday 7 January 2026, 18:40 in Lisbon (UTC+0)
export const NOW = new Date("2026-01-07T18:40:00Z");

export const summary: StatsSummary = {
  range: "month",
  from: "2025-12-09T00:00:00.000Z",
  to: "2026-01-07T18:30:00.000Z",
  typicalDay,
  heatmap,
  duration: { visits: 214, averageMinutes: 58, medianMinutes: 49 },
  today: [
    { at: "2026-01-07T00:00:00.000Z", count: 0 },
    { at: "2026-01-07T07:10:00.000Z", count: 1 },
    { at: "2026-01-07T07:25:00.000Z", count: 3 },
    { at: "2026-01-07T08:20:00.000Z", count: 1 },
    { at: "2026-01-07T08:50:00.000Z", count: 0 },
    { at: "2026-01-07T13:05:00.000Z", count: 1 },
    { at: "2026-01-07T13:50:00.000Z", count: 0 },
    { at: "2026-01-07T18:02:00.000Z", count: 2 },
    { at: "2026-01-07T18:20:00.000Z", count: 5 },
    { at: "2026-01-07T18:40:00.000Z", count: 5 },
  ],
};

export const stats = toStats(summary, NOW);
export const todayStats = toStats({ ...summary, range: "today" }, NOW);
export const emptyStats = toStats(
  {
    ...summary,
    typicalDay: typicalDay.map(() => 0),
    heatmap: heatmap.map((row) => row.map(() => 0)),
    duration: { visits: 0, averageMinutes: null, medianMinutes: null },
    today: [
      { at: "2026-01-07T00:00:00.000Z", count: 0 },
      { at: "2026-01-07T18:40:00.000Z", count: 0 },
    ],
  },
  NOW,
);
