import { Injectable } from '@nestjs/common';
import { CheckinMethod } from '@prisma/client';
import type { CheckinMethodStrategy } from '../checkin-method.strategy.js';

/**
 * Method C ("modo simples"): login + button, no proof of presence.
 * Trust only; meant for development and demos (see ROADMAP section 4).
 */
@Injectable()
export class SimpleCheckinMethod implements CheckinMethodStrategy {
  readonly method = CheckinMethod.SIMPLE;

  // Being authenticated is the whole check: nothing else to verify
  verify(): Promise<void> {
    return Promise.resolve();
  }
}
