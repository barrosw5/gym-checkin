import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type { Occupancy } from '@gym-checkin/shared';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  from,
  share,
  switchMap,
} from 'rxjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';

@Injectable()
export class OccupancyService implements OnModuleDestroy {
  private readonly logger = new Logger(OccupancyService.name);
  private readonly changed = new Subject<void>();
  private readonly shutdown = new Subject<void>();

  /** Emits once when the app shuts down. */
  readonly shutdown$: Observable<void> = this.shutdown.asObservable();

  /**
   * New occupancy after every change. share(): one DB count per change for
   * all connected clients, not one per client.
   */
  readonly updates$: Observable<Occupancy> = this.changed.pipe(
    // A burst of changes (e.g. auto-close) only needs the latest count
    switchMap(() =>
      from(this.getOccupancy()).pipe(
        // A failed count must not kill the stream for everyone
        catchError((err: unknown) => {
          this.logger.error('Failed to count occupancy', err);
          return EMPTY;
        }),
      ),
    ),
    share(),
  );

  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  /** Only counts (GDPR): never who is inside. */
  async getOccupancy(): Promise<Occupancy> {
    const [count, { capacity }] = await Promise.all([
      this.prisma.session.count({ where: { exitAt: null } }),
      this.settings.get(),
    ]);
    return { count, capacity };
  }

  /** Called after any session opens or closes (check-in, checkout, auto-close). */
  notifyChanged(): void {
    this.changed.next();
  }

  // Ends every open SSE stream, so shutdown (Render deploys) isn't blocked
  onModuleDestroy(): void {
    this.shutdown.next();
    this.shutdown.complete();
    this.changed.complete();
  }
}
