import type { MessageEvent } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { Subject } from 'rxjs';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { GymController, HEARTBEAT_MS } from './gym.controller.js';
import { OccupancyService } from './occupancy.service.js';

describe('GET /api/gym/occupancy', () => {
  let app: NestExpressApplication;
  let loggedIn: boolean;
  const getOccupancy = vi.fn();

  beforeEach(async () => {
    loggedIn = true;
    getOccupancy.mockResolvedValue({ count: 3, capacity: 10 });

    const moduleRef = await Test.createTestingModule({
      controllers: [GymController],
      providers: [{ provide: OccupancyService, useValue: { getOccupancy } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => loggedIn })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns only the counts (no personal data)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/gym/occupancy')
      .expect(200);

    expect(res.body).toEqual({ count: 3, capacity: 10 });
  });

  it('is for logged-in members only', async () => {
    loggedIn = false;

    // A guard returning false is a 403 in Nest; the real JwtAuthGuard gives 401
    await request(app.getHttpServer()).get('/api/gym/occupancy').expect(403);
  });
});

describe('GymController.stream (SSE)', () => {
  const updates$ = new Subject<{ count: number; capacity: number }>();
  const shutdown$ = new Subject<void>();
  const occupancy = {
    getOccupancy: vi.fn().mockResolvedValue({ count: 1, capacity: 10 }),
    updates$,
    shutdown$,
  } as unknown as OccupancyService;

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends the current value, then every change, then pings; ends on shutdown', async () => {
    vi.useFakeTimers();
    const events: MessageEvent[] = [];
    let completed = false;
    new GymController(occupancy).stream().subscribe({
      next: (e) => events.push(e),
      complete: () => (completed = true),
    });

    await vi.advanceTimersByTimeAsync(0);
    updates$.next({ count: 2, capacity: 10 });
    await vi.advanceTimersByTimeAsync(HEARTBEAT_MS);
    shutdown$.next();

    expect(events).toEqual([
      { data: { count: 1, capacity: 10 } },
      { data: { count: 2, capacity: 10 } },
      { type: 'ping', data: '' },
    ]);
    expect(completed).toBe(true);
  });
});
