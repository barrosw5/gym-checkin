import type { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

/** Every API route lives under /api; all other paths belong to the frontend. */
export const API_PREFIX = 'api';

/**
 * Shared app configuration, used by main.ts and by the e2e tests,
 * so tests exercise the app exactly as it runs in production.
 */
export function setupApp(app: INestApplication): void {
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
}
