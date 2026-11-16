import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ClosedBy } from '@prisma/client';
import { OccupancyService } from '../gym/occupancy.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';

const HOUR_MS = 60 * 60_000;
/** How often forgotten sessions are looked for. */
export const AUTO_CLOSE_INTERVAL_MS = 5 * 60_000;

/**
 * Closes sessions open for longer than Settings.autoCloseHours (someone
 * forgot to check out) and marks them closedBy AUTO, so statistics can
 * tell them apart from real visits.
 *
 * A plain setInterval instead of @nestjs/schedule: one fixed job does not
 * justify a new dependency. Safe to run on several instances at once: each
 * update only applies "if still open".
 */
@Injectable()
export class AutoCloseService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(AutoCloseService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
    private occupancy: OccupancyService,
  ) {}

  onApplicationBootstrap(): void {
    // Run once right away: catches up on sessions forgotten during a deploy
    void this.closeStaleSessions();
    this.timer = setInterval(
      () => void this.closeStaleSessions(),
      AUTO_CLOSE_INTERVAL_MS,
    );
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }

  /**
   * Returns how many sessions were closed. Never throws: a failed run is
   * logged and simply retried on the next tick.
   */
  async closeStaleSessions(now = new Date()): Promise<number> {
    try {
      const { autoCloseHours } = await this.settings.get();
      const maxDurationMs = autoCloseHours * HOUR_MS;

      const stale = await this.prisma.session.findMany({
        where: {
          exitAt: null,
          entryAt: { lte: new Date(now.getTime() - maxDurationMs) },
        },
        select: { id: true, entryAt: true },
      });
      if (stale.length === 0) return 0;

      const results = await this.prisma.$transaction(
        stale.map(({ id, entryAt }) =>
          this.prisma.session.updateMany({
            // "If still open": a checkout in the meantime wins
            where: { id, exitAt: null },
            // exitAt = entry + limit, not "now": a session found 4 min late
            // (interval) or after a long outage would inflate durations
            data: {
              exitAt: new Date(entryAt.getTime() + maxDurationMs),
              closedBy: ClosedBy.AUTO,
            },
          }),
        ),
      );
      const closed = results.reduce((sum, r) => sum + r.count, 0);

      if (closed > 0) {
        this.logger.log(`Auto-closed ${closed} forgotten session(s)`);
        this.occupancy.notifyChanged();
      }
      return closed;
    } catch (err) {
      this.logger.error('Auto-close failed', err);
      return 0;
    }
  }
}
