import type { Response } from 'express';
import { AUTH_COOKIE } from './auth.constants.js';

/** The session cookie, with the same flags wherever a session starts. */
export function setAuthCookie(res: Response, token: string, production: boolean): void {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true, // JS cannot read it
    // HTTPS only in production (localhost dev runs on plain HTTP)
    secure: production,
    sameSite: 'lax',
  });
}
