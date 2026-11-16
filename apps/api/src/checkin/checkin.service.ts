import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  type CheckinMethod,
  ClosedBy,
  Prisma,
  SessionMethod,
} from '@prisma/client';
import type { CheckinInput } from '@gym-checkin/shared';
import { OccupancyService } from '../gym/occupancy.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';
import {
  CHECKIN_METHOD_STRATEGIES,
  type CheckinMethodStrategy,
} from './checkin-method.strategy.js';

// Record over the enum: adding a CheckinMethod without saying how its
// sessions are recorded is a compile error, not a runtime surprise
const SESSION_METHOD: Record<CheckinMethod, SessionMethod> = {
  SCREEN_QR: SessionMethod.SCREEN_QR,
  RECEPTION_APPROVAL: SessionMethod.RECEPTION_APPROVAL,
};

// Prisma's code for a unique constraint violation
const UNIQUE_VIOLATION = 'P2002';

/** Opened session as returned to the client (no user data). */
export interface CheckinResult {
  id: string;
  entryAt: Date;
  method: SessionMethod;
}

/** A session still in progress (no user data). */
export interface OpenSession {
  id: string;
  entryAt: Date;
}

/** Closed session as returned to the client (no user data). */
export interface CheckoutResult {
  id: string;
  entryAt: Date;
  exitAt: Date;
}

@Injectable()
export class CheckinService {
  private readonly strategies: Map<CheckinMethod, CheckinMethodStrategy>;

  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
    private occupancy: OccupancyService,
    @Inject(CHECKIN_METHOD_STRATEGIES) strategies: CheckinMethodStrategy[],
  ) {
    this.strategies = new Map(strategies.map((s) => [s.method, s]));
  }

  async checkIn(userId: string, input: CheckinInput): Promise<CheckinResult> {
    const { enabledMethods } = await this.settings.get();
    const strategy = this.strategies.get(input.method);
    // Enabled in Settings but not implemented yet (e.g. SCREEN_QR before
    // Phase 3) is treated the same as disabled: the method is not available
    if (!enabledMethods.includes(input.method) || !strategy) {
      throw new ForbiddenException('Check-in method not available');
    }

    // Method-specific proof of presence (e.g. a fresh QR token)
    await strategy.verify({ userId, input });

    let session: CheckinResult;
    try {
      session = await this.prisma.session.create({
        data: { userId, method: SESSION_METHOD[input.method] },
        select: { id: true, entryAt: true, method: true },
      });
    } catch (err) {
      // No "is there an open session?" query first: two quick taps would both
      // pass it (race condition). The partial unique index
      // one_open_session_per_user is the single source of truth.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException('You are already checked in');
      }
      throw err;
    }
    this.occupancy.notifyChanged();
    return session;
  }

  /**
   * Methods a student can use right now, so the UI shows the right button.
   * Not secret (no personal data); every action still re-checks Settings.
   */
  async getEnabledMethods(): Promise<CheckinMethod[]> {
    const { enabledMethods } = await this.settings.get();
    return enabledMethods;
  }

  /** The user's open session, or null when they are not in the gym. */
  getOpenSession(userId: string): Promise<OpenSession | null> {
    return this.prisma.session.findFirst({
      where: { userId, exitAt: null },
      select: { id: true, entryAt: true },
    });
  }

  /**
   * Closes the user's open session. No token: leaving proves nothing and
   * nobody gains from a fake checkout (see CLAUDE.md).
   */
  async checkOut(userId: string): Promise<CheckoutResult> {
    const open = await this.getOpenSession(userId);
    if (!open) {
      throw new ConflictException('You are not checked in');
    }

    const exitAt = new Date();
    // Conditional update ("only if still open"): if a double tap or the
    // auto-close job closed it between the read and here, count is 0 and
    // the first close wins instead of being overwritten
    const { count } = await this.prisma.session.updateMany({
      where: { id: open.id, exitAt: null },
      data: { exitAt, closedBy: ClosedBy.USER },
    });
    if (count === 0) {
      throw new ConflictException('You are not checked in');
    }
    this.occupancy.notifyChanged();
    return { ...open, exitAt };
  }
}
