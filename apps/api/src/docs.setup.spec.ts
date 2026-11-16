import type { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder, type SchemaObject } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AdminSessionsController } from './admin/admin-sessions.controller.js';
import { AdminSessionsService } from './admin/admin-sessions.service.js';
import { setupApp } from './app.setup.js';
import { StatsController } from './stats/stats.controller.js';
import { StatsService } from './stats/stats.service.js';

describe('API docs', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StatsController, AdminSessionsController],
      providers: [
        { provide: StatsService, useValue: {} },
        { provide: AdminSessionsService, useValue: {} },
      ],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    setupApp(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const document = () => SwaggerModule.createDocument(app, new DocumentBuilder().build());

  it('describes query parameters from the same zod schema that validates them', () => {
    const [range] = document().paths['/api/stats/summary'].get?.parameters ?? [];

    expect(range).toMatchObject({
      name: 'range',
      in: 'query',
      required: false,
      schema: { type: 'string', enum: ['today', 'week', 'month', 'quarter'], default: 'week' },
    });
  });

  it('lists every parameter of a union query as optional (?open=true or ?from=&to=)', () => {
    const names = (document().paths['/api/admin/sessions'].get?.parameters ?? []).map((p) =>
      'name' in p ? [p.name, p.required] : [],
    );

    expect(names).toEqual([
      ['open', false],
      ['from', false],
      ['to', false],
    ]);
  });

  it('describes a JSON body from its zod schema', () => {
    const body = document().paths['/api/admin/sessions/{id}'].patch?.requestBody;
    const schema = (body && 'content' in body ? body.content['application/json'].schema : {}) as SchemaObject;

    expect(Object.keys(schema.properties ?? {})).toEqual(['entryAt', 'exitAt']);
  });

  it('marks guarded routes with the session cookie', () => {
    expect(document().paths['/api/stats/summary'].get?.security).toEqual([{ cookie: [] }]);
  });
});
