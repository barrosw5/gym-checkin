import type { Role } from '@prisma/client';

/** What AuthService.login() signs into the JWT. */
export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
  /** Issued at, in whole seconds (added by the JWT library when signing). */
  iat?: number;
}

/**
 * The authenticated user that JwtStrategy.validate() puts on `req.user`.
 * One type for every reader (controllers, RolesGuard) instead of `as any`.
 */
export interface AuthUser {
  userId: string;
  username: string;
  role: Role;
  /** Public demo account: some actions are refused to it. */
  isDemo: boolean;
}
