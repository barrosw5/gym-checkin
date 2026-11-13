import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { AuthController, LOGIN_RATE_LIMIT } from './auth.controller.js';
import { AuthService } from './auth.service.js';

// Real HTTP stack (guards, pipes, trust proxy) with a mocked AuthService,
// so the rate limit is tested end to end without a database
describe('POST /api/auth/login rate limit', () => {
  let app: NestExpressApplication;
  const validateUser = vi.fn();

  beforeEach(async () => {
    validateUser.mockReset();
    validateUser.mockRejectedValue(new UnauthorizedException());

    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: { validateUser } },
        { provide: ConfigService, useValue: { get: vi.fn() } },
      ],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const attempt = (username: unknown, ip = '203.0.113.1') =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', ip)
      .send({ username, password: 'wrong' });

  it(`returns 429 after ${LOGIN_RATE_LIMIT.limit} attempts for the same user and IP`, async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT.limit; i++) {
      await attempt('joao').expect(401);
    }

    const res = await attempt('joao').expect(429);
    expect(res.headers['retry-after']).toBeDefined();
    // Blocked before the service: no bcrypt work for throttled requests
    expect(validateUser).toHaveBeenCalledTimes(LOGIN_RATE_LIMIT.limit);
  });

  it('counts the username case- and whitespace-insensitively', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT.limit; i++) {
      await attempt(i % 2 ? 'JOAO' : ' joao ').expect(401);
    }

    await attempt('Joao').expect(429);
  });

  it('does not block other users on the same IP (shared residence NAT)', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT.limit; i++) {
      await attempt('joao').expect(401);
    }

    await attempt('maria').expect(401);
  });

  it('does not block the same user from another IP', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT.limit; i++) {
      await attempt('joao').expect(401);
    }

    await attempt('joao', '198.51.100.7').expect(401);
  });

  it('also throttles invalid bodies (guards run before validation)', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT.limit; i++) {
      await attempt(123).expect(400);
    }

    await attempt(123).expect(429);
  });
});
