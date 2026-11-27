import { useEffect, useState } from "react";
import { demoService } from "../core/services/demoService";
import type { OccupancyView } from "../core/types/occupancy";

/** The login page asks this often; the API reuses its answer for 15 s. */
const REFRESH_MS = 30_000;

/** The public demo's occupancy (null: no demo), refreshed while on screen. */
export const useDemo = () => {
  const [occupancy, setOccupancy] = useState<OccupancyView | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      void demoService.getOccupancy().then((value) => {
        if (!cancelled) setOccupancy(value);
      });
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { occupancy };
};
