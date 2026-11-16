import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';

describe('GET /api/stats/summary', () => {
  let app: NestExpressApplication;
  let loggedIn: boolean;
  const summary = vi.fn();

  beforeEach(async () => {
    vi.resetAllMocks();
    loggedIn = true;
    summary.mockResolvedValue({ range: 'week' });

    const moduleRef = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [{ provide: StatsService, useValue: { summary } }],
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

  it('uses the range from the query', async () => {
    await request(app.getHttpServer()).get('/api/stats/summary?range=quarter').expect(200);

    expect(summary).toHaveBeenCalledWith('quarter');
  });

  it('defaults to the last week', async () => {
    await request(app.getHttpServer()).get('/api/stats/summary').expect(200);

    expect(summary).toHaveBeenCalledWith('week');
  });

  it('rejects an unknown range with 400', async () => {
    await request(app.getHttpServer()).get('/api/stats/summary?range=year').expect(400);

    expect(summary).not.toHaveBeenCalled();
  });

  it('is closed to visitors who are not signed in', async () => {
    loggedIn = false;

    await request(app.getHttpServer()).get('/api/stats/summary').expect(403);
  });
});
