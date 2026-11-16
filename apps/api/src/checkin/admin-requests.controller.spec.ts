import { ConflictException, type ExecutionContext } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupApp } from '../app.setup.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminRequestsController } from './admin-requests.controller.js';
import { CheckinRequestController } from './checkin-request.controller.js';
import { CheckinRequestService } from './checkin-request.service.js';

const ID = '3f0c5a4e-8a52-4a3e-9d6b-2f1d0c9b7a10';

// Real RolesGuard and validation; JwtAuthGuard replaced by one that logs in
// as user u1 with the role from the X-Test-Role header
describe('check-in requests (HTTP)', () => {
  let app: NestExpressApplication;
  const service = {
    create: vi.fn(),
    getLatest: vi.fn(),
    listPending: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
  };

  beforeEach(async () => {
    for (const fn of Object.values(service)) fn.mockReset();
    service.create.mockResolvedValue({ id: 'r1', status: 'PENDING' });
    service.listPending.mockResolvedValue([]);

    const moduleRef = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }])],
      controllers: [CheckinRequestController, AdminRequestsController],
      providers: [{ provide: CheckinRequestService, useValue: service }],
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

  const http = () => request(app.getHttpServer());

  it('POST /api/checkin/requests creates a request for the logged-in student (201)', async () => {
    await http()
      .post('/api/checkin/requests')
      .set('X-Test-Role', 'STUDENT')
      .expect(201);

    expect(service.create).toHaveBeenCalledWith('u1');
  });

  it('GET /api/checkin/requests/current wraps the latest request', async () => {
    service.getLatest.mockResolvedValue(null);

    const res = await http()
      .get('/api/checkin/requests/current')
      .set('X-Test-Role', 'STUDENT')
      .expect(200);

    expect(res.body).toEqual({ request: null });
  });

  it('refuses the pending list (names, rooms) to students with 403', async () => {
    await http().get('/api/admin/requests').set('X-Test-Role', 'STUDENT').expect(403);

    expect(service.listPending).not.toHaveBeenCalled();
  });

  it('lets reception approve, recording who decided (200)', async () => {
    const res = await http()
      .post(`/api/admin/requests/${ID}/approve`)
      .set('X-Test-Role', 'RECEPTION')
      .expect(200);

    expect(res.body).toEqual({ status: 'APPROVED' });
    expect(service.approve).toHaveBeenCalledWith(ID, 'u1');
  });

  it('rejects a malformed id with 400 before reaching the service', async () => {
    await http()
      .post('/api/admin/requests/not-a-uuid/reject')
      .set('X-Test-Role', 'ADMIN')
      .expect(400);

    expect(service.reject).not.toHaveBeenCalled();
  });

  it('passes the 409 (no longer pending) through', async () => {
    service.reject.mockRejectedValue(new ConflictException());

    await http()
      .post(`/api/admin/requests/${ID}/reject`)
      .set('X-Test-Role', 'RECEPTION')
      .expect(409);
  });
});
