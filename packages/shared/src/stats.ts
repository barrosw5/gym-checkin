import { z } from 'zod';

/**
 * The residence's time zone. Statistics group by local hour ("18:00 on a
 * Monday"), so the API needs it; shared so web and API never disagree.
 */
export const RESIDENCE_TIME_ZONE = 'Europe/Lisbon';

/** Period filter of the statistics page: today, 7, 30 or 90 days. */
export const STATS_RANGES = ['today', 'week', 'month', 'quarter'] as const;
export type StatsRange = (typeof STATS_RANGES)[number];

/** Query of GET /api/stats/summary. */
export const statsQuerySchema = z.object({ range: z.enum(STATS_RANGES).default('week') });
export type StatsQuery = z.infer<typeof statsQuerySchema>;

/** How long visits last in the period (finished visits only). */
export interface VisitDuration {
  visits: number;
  /** null when there were no visits. */
  averageMinutes: number | null;
  /** The middle visit: one 4-hour visit does not pull it up like the average. */
  medianMinutes: number | null;
}

/** From this instant on, this many people were inside (one step of a step line). */
export interface OccupancyPoint {
  at: string;
  count: number;
}

/**
 * GET /api/stats/summary: only aggregates (GDPR), never who was inside.
 * Averages are time-weighted: someone inside for 1 of 15 minutes adds 1/15.
 */
export interface StatsSummary {
  range: StatsRange;
  /** The period as ISO instants: from local midnight to now. */
  from: string;
  to: string;
  /**
   * Typical day: average people per 15-minute interval (96 values, local
   * time). null = no data yet (e.g. later today), not an empty gym.
   */
  typicalDay: (number | null)[];
  /** Average people per weekday (Monday first) and hour: 7 rows of 24, null = no data. */
  heatmap: (number | null)[][];
  duration: VisitDuration;
  /**
   * Today, exact: a step line from local midnight to now (a point at every
   * entry and exit). Always sent, whatever the range, to compare with the typical day.
   */
  today: OccupancyPoint[];
}
