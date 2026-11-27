// Mirrors GET /api/admin/qr/current (dates arrive as ISO strings in JSON)
export interface QrTokenDto {
  token: string;
  refreshAt: string;
  windowSeconds: number;
  secondsLeft: number;
}

/** The code on screen and when it stops being the current one. */
export interface ScreenQr {
  url: string;
  /** This device's time (ms) when the next code starts. */
  expiresAt: number;
  windowSeconds: number;
}
