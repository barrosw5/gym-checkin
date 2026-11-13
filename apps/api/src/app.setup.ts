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
  // Render puts a proxy in front of the app: trust exactly one hop so req.ip is
  // the client's IP (from X-Forwarded-For) instead of the proxy's. Trusting
  // every hop (`true`) would let clients spoof their IP and dodge rate limits.
  app.set('trust proxy', 1);
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
}
