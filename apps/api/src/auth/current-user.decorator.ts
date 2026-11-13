import {
  createParamDecorator,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from './auth-user.js';

/** Exported separately so it can be unit tested without the Nest runtime. */
export function getCurrentUser(
  _data: unknown,
  context: ExecutionContext,
): AuthUser {
  const user = context.switchToHttp().getRequest<Request>().user;
  // Only happens if a route forgot JwtAuthGuard: fail closed, never undefined
  if (!user) throw new UnauthorizedException();
  return user as AuthUser;
}

/**
 * Injects the authenticated user into a handler: `@CurrentUser() user: AuthUser`.
 * Keeps controllers free of `@Req()` and of casts on `req.user`.
 * Requires JwtAuthGuard on the route.
 */
export const CurrentUser = createParamDecorator(getCurrentUser);
