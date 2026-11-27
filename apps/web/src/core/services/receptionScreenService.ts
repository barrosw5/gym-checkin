import { qrApi } from "../api/qrApi";
import type { ScreenQr } from "../types/qr";

/**
 * How often the screen asks for the token, on top of asking again right when
 * the code changes. Polling keeps working when a request fails; the API also
 * accepts the previous window, so being a few seconds late is harmless.
 */
export const QR_POLL_MS = 5_000;

/**
 * The link inside the QR. The student's camera opens it in the browser
 * (page /c/<token>), so no app is needed. Absolute URL: a QR scanner has no
 * "current site" to resolve a relative path against.
 */
export const checkinUrl = (origin: string, token: string): string =>
  `${origin}/c/${encodeURIComponent(token)}`;

/** Whole seconds until the next code, never negative. */
export const secondsUntil = (expiresAt: number, now: number): number =>
  Math.max(0, Math.ceil((expiresAt - now) / 1000));

export const receptionScreenService = {
  /** The code to show right now. */
  getQr: async (origin: string): Promise<ScreenQr> => {
    const { token, secondsLeft, windowSeconds } = await qrApi.getCurrent();
    return {
      url: checkinUrl(origin, token),
      // A duration added to this device's clock: a wrong clock cancels out
      expiresAt: Date.now() + secondsLeft * 1000,
      windowSeconds,
    };
  },
};
