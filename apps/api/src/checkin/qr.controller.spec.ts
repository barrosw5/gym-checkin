import type { ExecutionContext } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { QrController } from './qr.controller.js';
import { QrTokenService } from './qr-token.service.js';

// Real RolesGuard; JwtAuthGuard replaced by one that logs in with the role
// from the X-Test-Role header
describe('GET /api/admin/qr/current', () => {
  let app: NestExpressApplication;
  const current = vi.fn();

  beforeEach(async () => {
    current.mockReset();
    current.mockResolvedValue({ token: 'tok', windowSeconds: 30 });
    const moduleRef = await Test.createTestingModule({
      controllers: [QrController],
      providers: [{ provide: QrTokenService, useValue: { current } }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: 'u1', role: req.headers['x-test-role'] };
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

  const get = (role: string) =>
    request(app.getHttpServer())
      .get('/api/admin/qr/current')
      .set('X-Test-Role', role);

  it.each(['RECEPTION', 'ADMIN'])('gives %s the current token, never cached', async (role) => {
    const res = await get(role).expect(200);

    expect(res.body).toEqual({ token: 'tok', windowSeconds: 30 });
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('refuses students with 403 (they could check in from their room)', async () => {
    await get('STUDENT').expect(403);

    expect(current).not.toHaveBeenCalled();
  });
});
