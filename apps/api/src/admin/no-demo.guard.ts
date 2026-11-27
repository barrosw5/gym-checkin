import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.js';

/**
 * Refuses public demo accounts: anyone can open them, so they must not change
 * accounts (a visitor could lock the others out, or import "real" members and
 * switch the demo off). Use after JwtAuthGuard.
 */
@Injectable()
export class NoDemoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest<{ user: AuthUser }>();
    if (user.isDemo) throw new ForbiddenException('Demo accounts cannot manage accounts');
    return true;
  }
}
