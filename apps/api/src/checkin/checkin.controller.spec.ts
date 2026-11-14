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
describe('POST /api/checkin', () => {
  let app: NestExpressApplication;
  const checkIn = vi.fn();

  beforeEach(async () => {
    checkIn.mockReset();
    checkIn.mockResolvedValue({ id: 's1', method: 'SIMPLE' });

    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
      controllers: [CheckinController],
      providers: [{ provide: CheckinService, useValue: { checkIn } }],
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
