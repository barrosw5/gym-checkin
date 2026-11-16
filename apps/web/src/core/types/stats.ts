import type { StatsRange, VisitDuration } from "@gym-checkin/shared";

/** One minute of the day on the occupancy chart. null = no line there. */
export interface ChartRow {
  /** Minutes since local midnight, 0-1440. */
  minute: number;
  /** Today, exact (steps at each entry/exit); null after now. */
  today: number | null;
  /** Typical day of the period (average); null where there is no data. */
  typical: number | null;
}

/** A quiet hour still ahead today. */
export interface BestHour {
  hour: number;
  average: number;
}

/** The statistics page, ready to draw. */
export interface Stats {
  range: StatsRange;
  chart: ChartRow[];
  /** Most people at once today, and when (null: nobody came yet). */
  peakToday: { count: number; minute: number } | null;
  /** Busiest hour of the typical day (null: no data). */
  peakTypical: { hour: number; average: number } | null;
  /** 7 weekdays (Monday first) × 24 hours, average people; null = no data. */
  heatmap: (number | null)[][];
  duration: VisitDuration;
  /** Up to two quiet hours left today, in time order. */
  best: BestHour[];
  /** Today's row in the heatmap (0 = Monday). */
  todayWeekday: number;
  /** false: nobody came in the whole period (show an empty state). */
  hasVisits: boolean;
}
