import {
  Controller,
  Get,
  type MessageEvent,
  Sse,
  UseGuards,
} from '@nestjs/common';
import {
  type Observable,
  defer,
  interval,
  map,
  merge,
  takeUntil,
} from 'rxjs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { OccupancyService } from './occupancy.service.js';

/**
 * A small event every 25 s keeps idle connections open through
 * proxies (Render closes silent connections). Named "ping", so the browser's
 * `onmessage` ignores it.
 */
export const HEARTBEAT_MS = 25_000;

@Controller('gym')
// Residents only: the occupancy is not for the whole internet
@UseGuards(JwtAuthGuard)
export class GymController {
  constructor(private occupancy: OccupancyService) {}

  @Get('occupancy')
  getOccupancy() {
    return this.occupancy.getOccupancy();
  }

  /** Server-Sent Events: the current value first, then one per change. */
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    const occupancy$ = merge(
      // defer: count when this client connects, not when the route is built
      defer(() => this.occupancy.getOccupancy()),
      this.occupancy.updates$,
    ).pipe(map((data): MessageEvent => ({ data })));

    const heartbeat$ = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );

    // On shutdown every stream ends, so open connections don't block a deploy
    return merge(occupancy$, heartbeat$).pipe(
      takeUntil(this.occupancy.shutdown$),
    );
  }
}
