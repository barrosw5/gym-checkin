import { useEffect, useState } from "react";
import { pendingRequestsService } from "../core/services/pendingRequestsService";
import type { PendingRequest, RequestDecision } from "../core/types/requests";

/**
 * Reception's live list of check-in requests. No manual refresh after a
 * decision: the SSE stream sends the new list to every reception screen.
 */
export const usePendingRequests = () => {
  const [requests, setRequests] = useState<PendingRequest[] | null>(null);
  const [stale, setStale] = useState(false);
  // The request being decided: disables its buttons (no double clicks)
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(
    () =>
      // The returned close function is the effect's cleanup (unmount)
      pendingRequestsService.subscribe(
        (list) => {
          setRequests(list);
          setStale(false);
        },
        () => setStale(true),
      ),
    [],
  );

  const decide = async (id: string, decision: RequestDecision) => {
    setBusyId(id);
    setMessage("");
    try {
      await pendingRequestsService.decide(id, decision);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBusyId(null);
    }
  };

  return { requests, stale, busyId, message, decide };
};
