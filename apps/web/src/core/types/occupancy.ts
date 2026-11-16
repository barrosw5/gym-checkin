import type { Occupancy } from "@gym-checkin/shared";

/** What the UI shows: the counts plus the rules derived from them. */
export interface OccupancyView extends Occupancy {
  /** Informative only: a full gym never blocks check-in (ROADMAP 5.4). */
  isFull: boolean;
}
