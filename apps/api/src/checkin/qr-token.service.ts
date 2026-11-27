import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { SettingsService } from '../settings/settings.service.js';

// 16 bytes = 128 bits: impossible to guess, and a short token keeps the QR
// code simple (fewer modules, faster scan from a distance)
const TOKEN_BYTES = 16;

/** The token the reception screen should show right now. */
export interface QrToken {
  token: string;
  /** When the screen must fetch a new token (start of the next window). */
  refreshAt: Date;
  windowSeconds: number;
  /**
   * The same moment as a duration, from the server's clock: the screen can
   * count down correctly even when its own clock is wrong.
   */
  secondsLeft: number;
}

/**
 * Rotating QR token for check-in method A (ROADMAP 5.1):
 * token = HMAC(QR_SECRET, floor(now / windowSeconds)).
 *
 * Stateless: nothing is stored, the server recomputes the token to check it.
 * A photo of the QR stops working after at most 2 windows, which is what
 * proves the student is in front of the screen.
 */
@Injectable()
export class QrTokenService {
  private readonly secret: string;

  constructor(
    config: ConfigService,
    private settings: SettingsService,
  ) {
    this.secret = config.getOrThrow<string>('QR_SECRET');
  }

  async current(now = new Date()): Promise<QrToken> {
    const { qrWindowSeconds } = await this.settings.get();
    const window = windowOf(now, qrWindowSeconds);
    const refreshAt = new Date((window + 1) * qrWindowSeconds * 1000);
    return {
      token: this.sign(window, qrWindowSeconds),
      refreshAt,
      windowSeconds: qrWindowSeconds,
      secondsLeft: (refreshAt.getTime() - now.getTime()) / 1000,
    };
  }

  /**
   * Accepts the current window and the previous one: a student who scans
   * just before the QR changes still gets in. Future windows are rejected.
   */
  async isValid(token: string, now = new Date()): Promise<boolean> {
    const { qrWindowSeconds } = await this.settings.get();
    const window = windowOf(now, qrWindowSeconds);
    return [window, window - 1].some((w) =>
      safeEqual(token, this.sign(w, qrWindowSeconds)),
    );
  }

  private sign(window: number, windowSeconds: number): string {
    // The window length is signed too: changing it in Settings invalidates
    // old tokens instead of making a different window match by accident
    return createHmac('sha256', this.secret)
      .update(`${windowSeconds}:${window}`)
      .digest()
      .subarray(0, TOKEN_BYTES)
      .toString('base64url');
  }
}

function windowOf(now: Date, windowSeconds: number): number {
  return Math.floor(now.getTime() / (windowSeconds * 1000));
}

/**
 * Constant-time comparison: `===` stops at the first different character,
 * and that timing difference can leak the token byte by byte.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
