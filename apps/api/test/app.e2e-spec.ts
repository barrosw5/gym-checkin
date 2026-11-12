import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { setupApp } from './../src/app.setup.js';

describe('App (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    setupApp(app);
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ ok: true });
  });

  it('POST /api/auth/login rejects an invalid body with 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ username: 123 })
      .expect(400);

    expect(res.body).toMatchObject({ message: 'Validation failed' });
    expect(res.body.errors).toHaveLength(2);
  });

  it('does not expose the x-powered-by header', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
