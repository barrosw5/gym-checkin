import type { Occupancy } from "@gym-checkin/shared";
import { occupancyApi } from "../api/occupancyApi";
import type { OccupancyView } from "../types/occupancy";


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
