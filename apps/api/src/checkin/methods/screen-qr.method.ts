import { ForbiddenException, Injectable } from '@nestjs/common';
import { CheckinMethod } from '@prisma/client';
import type {
  CheckinAttempt,
  CheckinMethodStrategy,
} from '../checkin-method.strategy.js';
import { QrTokenService } from '../qr-token.service.js';

/**
 * Method A: the student scans the rotating QR on the reception screen.
 * Proof of presence = a token that is at most two windows old.
 */
@Injectable()
export class ScreenQrCheckinMethod implements CheckinMethodStrategy {
  readonly method = CheckinMethod.SCREEN_QR;

  constructor(private qrTokens: QrTokenService) {}

  async verify({ input }: CheckinAttempt): Promise<void> {
    // The zod schema already requires a token for SCREEN_QR; this narrows
    // the type and guards against being called with another method's input
    if (input.method !== 'SCREEN_QR' || !(await this.qrTokens.isValid(input.token))) {
      // 403: the user is authenticated, but this attempt proves nothing
      throw new ForbiddenException('QR code expired or invalid, scan it again');
    }
  }
}
