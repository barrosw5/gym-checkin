import { useEffect, useState } from "react";
import {
  QR_POLL_MS,
  receptionScreenService,
} from "../core/services/receptionScreenService";

/**
 * The QR link, refreshed every few seconds. On a failed refresh the last
 * QR stays on screen (still valid for up to one more window) and `stale`
 * flags the problem, instead of the screen going blank.
 */
export const useReceptionScreen = () => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      receptionScreenService
        .getQrUrl(window.location.origin)
        .then((url) => {
          if (cancelled) return;
          setQrUrl(url);
          setStale(false);
        })
        .catch(() => !cancelled && setStale(true));
    };

    refresh();
    const timer = setInterval(refresh, QR_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return { qrUrl, stale };
};
