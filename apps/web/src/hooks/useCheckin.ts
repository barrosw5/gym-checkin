import { useCallback, useEffect, useState } from "react";
import { checkinService } from "../core/services/checkinService";
import type { OpenSession } from "../core/types/checkin";

type CheckinState =
  | { status: "loading" }
  | { status: "in"; session: OpenSession }
  | { status: "out" }
  | { status: "error" };

const fromSession = (session: OpenSession | null): CheckinState =>
  session ? { status: "in", session } : { status: "out" };

/**
 * Whether the user is in the gym, plus the action to toggle it.
 * The API is the source of truth: after any failed action the state is
 * reloaded instead of guessed (e.g. a 409 because another tab checked out).
 */
export const useCheckin = () => {
  const [state, setState] = useState<CheckinState>({ status: "loading" });
  // Disables the button while a request is in flight (no double taps)
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    try {
      setState(fromSession(await checkinService.getOpenSession()));
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    // Ignore the answer if the component unmounted meanwhile
    let cancelled = false;
    checkinService
      .getOpenSession()
      .then((session) => !cancelled && setState(fromSession(session)))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async () => {
    if (state.status !== "in" && state.status !== "out") return;
    setBusy(true);
    setMessage("");
    try {
      if (state.status === "in") {
        await checkinService.checkOut();
        setState({ status: "out" });
      } else {
        setState(fromSession(await checkinService.checkIn()));
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return { state, busy, message, toggle, reload };
};
