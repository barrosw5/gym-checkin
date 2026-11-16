import { ConflictException, type ExecutionContext } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CHECKIN_RATE_LIMIT, CheckinController } from './checkin.controller.js';
import { CheckinService } from './checkin.service.js';

// Real HTTP stack (validation pipe, throttler, status codes) with the
// service mocked. JwtAuthGuard is replaced by one that logs in the user
// named in the X-Test-User header (the real guard has its own tests).
describe('CheckinController (HTTP)', () => {
  let app: NestExpressApplication;
  const checkIn = vi.fn();
  const checkOut = vi.fn();
  const getOpenSession = vi.fn();

  beforeEach(async () => {
    getOpenSession.mockReset();
    checkIn.mockReset();
    checkIn.mockResolvedValue({ id: 's1', method: 'SIMPLE' });
    checkOut.mockReset();
    checkOut.mockResolvedValue({ id: 's1' });

    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
      controllers: [CheckinController],
      providers: [{ provide: CheckinService, useValue: { checkIn, checkOut, getOpenSession } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: req.headers['x-test-user'], role: 'STUDENT' };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const post = (body: object, user = 'u1') =>
    request(app.getHttpServer())
      .post('/api/checkin')
      .set('X-Test-User', user)
      .send(body);

  describe('GET /api/checkin/current', () => {
    const getCurrent = (user = 'u1') =>
      request(app.getHttpServer())
        .get('/api/checkin/current')
        .set('X-Test-User', user);

    it("returns the logged-in user's open session", async () => {
      getOpenSession.mockResolvedValue({ id: 's1' });

      const res = await getCurrent('u1').expect(200);

      expect(res.body).toEqual({ session: { id: 's1' } });
      expect(getOpenSession).toHaveBeenCalledWith('u1');
    });

    it('returns { session: null } when not in the gym', async () => {
      getOpenSession.mockResolvedValue(null);

      const res = await getCurrent().expect(200);

      expect(res.body).toEqual({ session: null });
    });
  });

  describe('POST /api/checkout', () => {
    const postCheckout = (user = 'u1') =>
      request(app.getHttpServer())
        .post('/api/checkout')
        .set('X-Test-User', user);

    it('returns 200 (not 201) and closes the logged-in user session', async () => {
      const res = await postCheckout('u1').expect(200);

      expect(res.body).toEqual({ id: 's1' });
      expect(checkOut).toHaveBeenCalledWith('u1');
    });

    it('passes the 409 (no open session) from the service through', async () => {
      checkOut.mockRejectedValue(new ConflictException());

      await postCheckout().expect(409);
    });

    it(`returns 429 after ${CHECKIN_RATE_LIMIT.limit} requests from the same user`, async () => {
      for (let i = 0; i < CHECKIN_RATE_LIMIT.limit; i++) {
        await postCheckout().expect(200);
      }

      await postCheckout().expect(429);
    });
  });

  it('returns 201 with the new session', async () => {
    const res = await post({ method: 'SIMPLE' }).expect(201);

    expect(res.body).toEqual({ id: 's1', method: 'SIMPLE' });
  });

  it('checks in the logged-in user, ignoring any userId in the body', async () => {
    await post({ method: 'SIMPLE', userId: 'someone-else' }, 'u1').expect(201);

    expect(checkIn).toHaveBeenCalledWith('u1', { method: 'SIMPLE' });
  });

  it('rejects an invalid body with 400 before reaching the service', async () => {
    await post({ method: 'TELEPORT' }).expect(400);

    expect(checkIn).not.toHaveBeenCalled();
  });

  it('passes the 409 from the service through', async () => {
    checkIn.mockRejectedValue(new ConflictException());

    await post({ method: 'SIMPLE' }).expect(409);
  });

  it(`returns 429 after ${CHECKIN_RATE_LIMIT.limit} requests from the same user`, async () => {
    for (let i = 0; i < CHECKIN_RATE_LIMIT.limit; i++) {
      await post({ method: 'SIMPLE' }).expect(201);
    }

    await post({ method: 'SIMPLE' }).expect(429);
    // Another resident (same IP in the residence) is not affected
    await post({ method: 'SIMPLE' }, 'u2').expect(201);
  });
});
