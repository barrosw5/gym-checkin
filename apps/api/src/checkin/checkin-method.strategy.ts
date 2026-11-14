import type { CheckinMethod } from '@prisma/client';
import type { CheckinInput } from '@gym-checkin/shared';

/** What a method gets to decide whether this check-in proves presence. */
export interface CheckinAttempt {
  userId: string;
  input: CheckinInput;
}

/**
 * Strategy pattern: one implementation per check-in method.
 *
 * A method only answers "is this attempt valid?" (e.g. a fresh QR token).
 * The shared rules (method enabled, one open session per user) live in
 * CheckinService, so a new method never has to repeat or change them.
 */
export interface CheckinMethodStrategy {
  readonly method: CheckinMethod;
  /** Resolves if the attempt is valid; throws a Nest HTTP exception if not. */
  verify(attempt: CheckinAttempt): Promise<void>;
}

/**
 * DI token for the list of every registered strategy. Adding a method means
 * one new class plus one line in CheckinModule; nothing else changes.
 */
export const CHECKIN_METHOD_STRATEGIES = Symbol('CHECKIN_METHOD_STRATEGIES');
