import { useCallback, useEffect, useState } from "react";
import { occupancyService } from "../core/services/occupancyService";
import { sessionsTodayService } from "../core/services/sessionsTodayService";
import type { AdminSession } from "../core/types/adminSessions";
import { toTranslatable, type Translatable } from "../core/i18n/types";

/**
 * Today's sessions for reception. Reloads whenever the live occupancy
 * changes (someone came in or left), so the list stays current without a
 * separate stream.
 */
export const useSessionsToday = () => {
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Translatable | null>(null);

  const reload = useCallback(async () => {
    try {
      setSessions(await sessionsTodayService.listToday());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  // The occupancy stream sends its current value on connect, so its first
  // message also triggers the initial load
  useEffect(
    () =>
      occupancyService.subscribe(
        () => void reload(),
        () => undefined,
      ),
    [reload],
  );

  /** Runs a change; returns true on success (so the form can close). */
  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    setMessage(null);
    try {
      await action();
      return true;
    } catch (err) {
      setMessage(toTranslatable(err));
      return false;
    } finally {
      setBusyId(null);
      // A time correction does not change the occupancy: reload explicitly
      await reload();
    }
  };

  return {
    sessions,
    failed,
    busyId,
    message,
    reload,
    closeNow: (id: string) => run(id, () => sessionsTodayService.closeNow(id)),
    correctTimes: (id: string, entryLocal: string, exitLocal: string) =>
      run(id, () => sessionsTodayService.correctTimes(id, entryLocal, exitLocal)),
  };
};
