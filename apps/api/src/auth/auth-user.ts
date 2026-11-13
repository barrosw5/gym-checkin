import type { Role } from '@prisma/client';

/** What AuthService.login() signs into the JWT. */
export interface JwtPayload {
  sub: string;
  username: string;
  role: Role;
}

/**
 * The authenticated user that JwtStrategy.validate() puts on `req.user`.
 * One type for every reader (controllers, RolesGuard) instead of `as any`.
 */
export interface AuthUser {
  userId: string;
  username: string;
  role: Role;
}
