import type { CheckinMethodName } from "@gym-checkin/shared";
import { useCallback, useEffect, useState } from "react";
import { checkinService } from "../core/services/checkinService";
import type { OpenSession } from "../core/types/checkin";
import { toTranslatable, type Translatable } from "../core/i18n/types";

/** While waiting for reception: the student's screen asks every 2 s. */
const REQUEST_POLL_MS = 2_000;

type CheckinState =
  | { status: "loading" }
  | { status: "in"; session: OpenSession }
  | { status: "out"; methods: CheckinMethodName[] }
  // Method B: a pending request, waiting for reception
  | { status: "waiting" }
  | { status: "error" };

const DECISION_MESSAGES = {
  REJECTED: { key: "errors.checkin.rejected" },
  EXPIRED: { key: "errors.checkin.expired" },
} as const satisfies Record<string, Translatable>;

/**
 * Whether the user is in the gym, and the actions available. The API is the
 * source of truth: the state is (re)loaded from it instead of guessed.
 */
export const useCheckin = () => {
  const [state, setState] = useState<CheckinState>({ status: "loading" });
  // Disables the buttons while a request is in flight (no double taps)
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Translatable | null>(null);

  const load = useCallback(async (): Promise<CheckinState> => {
    const [session, methods, request] = await Promise.all([
      checkinService.getOpenSession(),
      checkinService.getEnabledMethods(),
      checkinService.getMyRequestStatus(),
    ]);
    if (session) return { status: "in", session };
    // A pending request survives a page reload: keep waiting for it
    if (request === "PENDING") return { status: "waiting" };
    return { status: "out", methods };
  }, []);

  const reload = useCallback(async () => {
    try {
      setState(await load());
    } catch {
      setState({ status: "error" });
    }
  }, [load]);

  useEffect(() => {
    // Ignore the answer if the component unmounted meanwhile
    let cancelled = false;
    load()
      .then((next) => !cancelled && setState(next))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [load]);

  // Poll the request only while waiting; stops on any other state
  useEffect(() => {
    if (state.status !== "waiting") return;
    const timer = setInterval(async () => {
      try {
        const status = await checkinService.getMyRequestStatus();
        if (status === "PENDING") return;
        if (status === "REJECTED" || status === "EXPIRED") {
          setMessage(DECISION_MESSAGES[status]);
        }
        await reload();
      } catch {
        // Network hiccup: try again on the next tick
      }
    }, REQUEST_POLL_MS);
    return () => clearInterval(timer);
  }, [state.status, reload]);

  /** Runs an action; on failure shows its message and reloads the state. */
  const run = async (action: () => Promise<CheckinState | void>) => {
    setBusy(true);
    setMessage(null);
    try {
      const next = await action();
      if (next) setState(next);
      else await reload();
    } catch (err) {
      setMessage(toTranslatable(err));
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return {
    state,
    busy,
    message,
    reload,
    /** RECEPTION_APPROVAL: ask and wait. */
    requestEntry: () =>
      run(async () => {
        await checkinService.requestEntry();
        return { status: "waiting" };
      }),
    leave: () =>
      run(async () => {
        await checkinService.checkOut();
      }),
  };
};
