import type { StatsRange } from "@gym-checkin/shared";
import { useEffect, useState } from "react";
import { statsService } from "../core/services/statsService";
import type { Stats } from "../core/types/stats";

/** The statistics page: the chosen period and its numbers. */
export const useStats = () => {
  const [range, setRange] = useState<StatsRange>("week");
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  // Bumped by "try again": the effect below runs again for the same range
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // A slower answer for an older choice must not overwrite the new one
    let current = true;
    // State changes only in the callbacks, once the answer arrives
    statsService.load(range).then(
      (result) => {
        if (!current) return;
        setStats(result);
        setFailed(false);
      },
      () => {
        if (current) setFailed(true);
      },
    );
    return () => {
      current = false;
    };
  }, [range, attempt]);

  return {
    range,
    setRange,
    stats,
    // Keep the old charts while the new period loads: no flash of "loading"
    loading: stats === null || stats.range !== range,
    failed,
    reload: () => setAttempt((n) => n + 1),
  };
};
