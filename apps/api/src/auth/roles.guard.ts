import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@prisma/client';
import type { Request } from 'express';
import type { AuthUser } from './auth-user.js';
import { ROLES_KEY } from './roles.decorator.js';

/**
 * Authorization (what may you do?), not authentication (who are you?).
 * Must run after JwtAuthGuard, which puts the user on the request:
 * `@UseGuards(JwtAuthGuard, RolesGuard)`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Method-level @Roles() overrides the controller-level one
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // No @Roles(): any authenticated user may pass
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest<Request>().user as
      Partial<AuthUser> | undefined;

    // 403, not 401: the user is known, they just lack permission
    if (!user?.role || !required.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
