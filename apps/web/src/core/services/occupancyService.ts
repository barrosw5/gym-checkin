import type { Occupancy } from "@gym-checkin/shared";
import { occupancyApi } from "../api/occupancyApi";

/** What the UI shows: the counts plus the rules derived from them. */
export interface OccupancyView extends Occupancy {
  /** Informative only: a full gym never blocks check-in (ROADMAP 5.4). */
  isFull: boolean;
}

export const toOccupancyView = (o: Occupancy): OccupancyView => ({
  ...o,
  isFull: o.count >= o.capacity,
});

export const occupancyService = {
  /** Live occupancy. Returns a function that stops listening. */
  subscribe: (
    onChange: (view: OccupancyView) => void,
    onConnectionLost: () => void,
  ): (() => void) =>
    occupancyApi.openStream({
      onUpdate: (o) => onChange(toOccupancyView(o)),
      onError: onConnectionLost,
    }),
};
