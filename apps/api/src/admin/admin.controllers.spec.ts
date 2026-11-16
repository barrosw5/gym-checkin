import type { ExecutionContext } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminSessionsController } from './admin-sessions.controller.js';
import { AdminSessionsService } from './admin-sessions.service.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';

const ID = '3f0c5a4e-8a52-4a3e-9d6b-2f1d0c9b7a10';

// Real RolesGuard and validation; JwtAuthGuard replaced by one that logs in
// with the role from the X-Test-Role header
describe('admin routes (HTTP)', () => {
  let app: NestExpressApplication;
  const sessions = { list: vi.fn(), correct: vi.fn() };
  const users = { list: vi.fn(), import: vi.fn(), update: vi.fn() };

  beforeEach(async () => {
    for (const fn of [...Object.values(sessions), ...Object.values(users)]) {
      fn.mockReset();
    }
    sessions.list.mockResolvedValue([]);
    users.import.mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminSessionsController, AdminUsersController],
      providers: [
        { provide: AdminSessionsService, useValue: sessions },
        { provide: AdminUsersService, useValue: users },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: 'me', role: req.headers['x-test-role'] };
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

  const as = (role: string) => ({
    get: (url: string) => request(app.getHttpServer()).get(url).set('X-Test-Role', role),
    post: (url: string) => request(app.getHttpServer()).post(url).set('X-Test-Role', role),
    patch: (url: string) => request(app.getHttpServer()).patch(url).set('X-Test-Role', role),
  });

  describe('sessions', () => {
    it('lets reception list open sessions', async () => {
      await as('RECEPTION').get('/api/admin/sessions?open=true').expect(200);

      expect(sessions.list).toHaveBeenCalledWith({ open: 'true' });
    });

    it('refuses students (other people\'s sessions are personal data)', async () => {
      await as('STUDENT').get('/api/admin/sessions?open=true').expect(403);
    });

    it('rejects a query without a valid filter with 400', async () => {
      await as('RECEPTION').get('/api/admin/sessions?from=yesterday').expect(400);

      expect(sessions.list).not.toHaveBeenCalled();
    });

    it('passes the correction and who made it to the service', async () => {
      const exitAt = '2026-11-16T19:00:00Z';

      await as('RECEPTION').patch(`/api/admin/sessions/${ID}`).send({ exitAt }).expect(200);

      expect(sessions.correct).toHaveBeenCalledWith(
        ID,
        { exitAt },
        expect.objectContaining({ userId: 'me', role: 'RECEPTION' }),
      );
    });
  });

  describe('users', () => {
    it('is admin only: reception gets 403', async () => {
      await as('RECEPTION').get('/api/admin/users').expect(403);
      await as('RECEPTION').post('/api/admin/users/import').send({ csv: 'a;1;abc' }).expect(403);
    });

    it('imports and never lets the response (temporary passwords) be cached', async () => {
      users.import.mockResolvedValue([{ username: 'ana', temporaryPassword: 'x' }]);

      const res = await as('ADMIN')
        .post('/api/admin/users/import')
        .send({ csv: 'Ana;101;ana' })
        .expect(201);

      expect(res.body).toEqual({ created: [{ username: 'ana', temporaryPassword: 'x' }] });
      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('strips fields that are not allowed (no role changes via PATCH)', async () => {
      await as('ADMIN').patch(`/api/admin/users/${ID}`).send({ active: false, role: 'ADMIN' }).expect(200);

      expect(users.update).toHaveBeenCalledWith(ID, { active: false }, expect.anything());
    });
  });
});
