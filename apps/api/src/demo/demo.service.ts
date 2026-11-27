import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OccupancyService } from '../gym/occupancy.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DEMO_HISTORY_DAYS, syncDemoData } from './demo-sync.js';

/** Same pace as the auto-close job: enough for the gym to look alive. */
export const DEMO_SYNC_INTERVAL_MS = 5 * 60_000;

/**
 * Demo mode (DEMO_MODE=true, off by default): fictional members come and go
 * during the day, so whoever tries the public demo sees a gym in use and
 * statistics that always reach today.
 */
@Injectable()
export class DemoService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(DemoService.name);
  private timer?: NodeJS.Timeout;
  private historyLoaded = false;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private occupancy: OccupancyService,
  ) {}

  onApplicationBootstrap(): void {
    if (this.config.get<string>('DEMO_MODE') !== 'true') return;
    this.logger.log('Demo mode on: simulating fictional members');
    // Not awaited: the app serves requests while the history loads
    void this.run();
    this.timer = setInterval(() => void this.run(), DEMO_SYNC_INTERVAL_MS);
  }

  onApplicationShutdown(): void {
    clearInterval(this.timer);
  }

  /**
   * The first successful run fills the whole history (which covers any
   * time the server was down); later ones only touch yesterday and today.
   * Never throws: a failed run is logged and retried on the next tick.
   */
  async run(now = new Date()): Promise<void> {
    try {
      const full = !this.historyLoaded;
      const result = await syncDemoData(this.prisma, {
        now,
        days: full ? DEMO_HISTORY_DAYS : 2,
        prune: full,
      });
      this.historyLoaded = true;
      if (result.created + result.closed + result.pruned > 0) {
        this.occupancy.notifyChanged();
      }
    } catch (err) {
      this.logger.error('Demo sync failed', err);
    }
  }
}
