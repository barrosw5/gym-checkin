import { useEffect, useState } from "react";
import { occupancyService } from "../core/services/occupancyService";
import type { OccupancyView } from "../core/types/occupancy";

/**
 * Live gym occupancy over SSE. `stale` is true while the connection is
 * down: the last known value stays on screen, flagged as possibly outdated.
 */
export const useOccupancy = () => {
  const [occupancy, setOccupancy] = useState<OccupancyView | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(
    () =>
      // The returned close function is the effect's cleanup (unmount)
      occupancyService.subscribe(
        (view) => {
          setOccupancy(view);
          setStale(false);
        },
        () => setStale(true),
      ),
    [],
  );

  return { occupancy, stale };
};
