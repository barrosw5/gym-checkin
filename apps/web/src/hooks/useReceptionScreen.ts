import { useEffect, useState } from "react";
import {
  QR_POLL_MS,
  receptionScreenService,
  secondsUntil,
} from "../core/services/receptionScreenService";
import type { ScreenQr } from "../core/types/qr";

/** Asked this long after the change, so the answer is surely the new code. */
const AFTER_CHANGE_MS = 300;

/**
 * The QR link, refreshed every few seconds and right when it changes, plus
 * the countdown. On a failed refresh the last QR stays on screen (still valid
 * for up to one more window) and `stale` flags the problem.
 */
export const useReceptionScreen = () => {
  const [qr, setQr] = useState<ScreenQr | null>(null);
  const [stale, setStale] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    let atChange: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      receptionScreenService
        .getQr(window.location.origin)
        .then((next) => {
          if (cancelled) return;
          setQr(next);
          setStale(false);
          setNow(Date.now());
          clearTimeout(atChange);
          atChange = setTimeout(refresh, next.expiresAt - Date.now() + AFTER_CHANGE_MS);
        })
        .catch(() => !cancelled && setStale(true));
    };

    refresh();
    const poll = setInterval(refresh, QR_POLL_MS);
    const tick = setInterval(() => setNow(Date.now()), 1_000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
      clearTimeout(atChange);
    };
  }, []);

  return {
    qrUrl: qr?.url ?? null,
    countdown: qr ? { secondsLeft: secondsUntil(qr.expiresAt, now), windowSeconds: qr.windowSeconds } : null,
    stale,
  };
};
