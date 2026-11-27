import { useCallback, useEffect, useState } from "react";
import { statsService } from "../core/services/statsService";
import type { Stats } from "../core/types/stats";

/** Today's curve grows during the day, so the home page asks again now and then. */
const REFRESH_MS = 5 * 60_000;

/** Today against the typical day of the last 30 days, and the best hours left. */
export const useTodayOutlook = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    const load = () =>
      void statsService.load("month").then(
        (result) => {
          if (!current) return;
          setStats(result);
          setFailed(false);
        },
        () => {
          if (current) setFailed(true);
        },
      );
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  return { stats, failed, reload };
};
