import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_PREFIX } from '@gym-checkin/shared';
import { AUTH_COOKIE } from './auth/auth.constants.js';

/** Where the interactive docs live (under /api, so the SPA never takes the path). */
export const DOCS_PATH = `${API_PREFIX}/docs`;

/**
 * Interactive API docs at /api/docs (OpenAPI JSON at /api/docs-json).
 * They describe the routes, not data: every route keeps its own guards, so
 * publishing the docs opens nothing. Turned off with API_DOCS=false.
 */
export function setupDocs(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('gym-checkin API')
    .setDescription(
      'Gym check-in for a student residence. Log in with POST /api/auth/login: ' +
        'the session is an httpOnly cookie, sent by the browser on every request.',
    )
    .setVersion('1.0')
    .addCookieAuth(AUTH_COOKIE)
    .addTag('auth', 'Login, logout, current user, password change')
    .addTag('checkin', 'Students only: check in (QR or reception approval) and check out')
    .addTag('gym', 'Any signed-in user: live occupancy (counts only)')
    .addTag('stats', 'Any signed-in user: aggregated statistics (never who)')
    .addTag('reception', 'Reception and admin: entry requests, QR screen, sessions')
    .addTag('admin', 'Admin only: accounts')
    .build();

  SwaggerModule.setup(DOCS_PATH, app, () => SwaggerModule.createDocument(app, config));
}
