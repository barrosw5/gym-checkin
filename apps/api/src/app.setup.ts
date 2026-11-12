import type { NestExpressApplication } from '@nestjs/platform-express';
import { API_PREFIX } from '@gym-checkin/shared';
import cookieParser from 'cookie-parser';

/**
 * Shared app configuration, used by main.ts and by the e2e tests,
 * so tests exercise the app exactly as it runs in production.
 */
export function setupApp(app: NestExpressApplication): void {
  // Don't advertise the framework (OWASP: avoid leaking server technology)
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
}
