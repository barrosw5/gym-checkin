import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import type { Express } from 'express';

/** Every API route lives under /api; all other paths belong to the frontend. */
export const API_PREFIX = 'api';

/**
 * Shared app configuration, used by main.ts and by the e2e tests,
 * so tests exercise the app exactly as it runs in production.
 */
export function setupApp(app: INestApplication): void {
  // Don't advertise the framework (OWASP: avoid leaking server technology)
  app.getHttpAdapter().getInstance<Express>().disable('x-powered-by');
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
}
