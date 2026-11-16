import { qrApi } from "../api/qrApi";

/**
 * How often the screen asks for the token. Polling (instead of waiting for
 * refreshAt) keeps working when the screen's clock is wrong: refreshAt is
 * server time. The API accepts the previous window too, so being up to
 * 5 s late is harmless.
 */
export const QR_POLL_MS = 5_000;

/**
 * The link inside the QR. The student's camera opens it in the browser
 * (page /c/<token>), so no app is needed. Absolute URL: a QR scanner has no
 * "current site" to resolve a relative path against.
 */
export const checkinUrl = (origin: string, token: string): string =>
  `${origin}/c/${encodeURIComponent(token)}`;

export const receptionScreenService = {
  /** The URL to encode in the QR right now. */
  getQrUrl: async (origin: string): Promise<string> => {
    const { token } = await qrApi.getCurrent();
    return checkinUrl(origin, token);
  },
};
