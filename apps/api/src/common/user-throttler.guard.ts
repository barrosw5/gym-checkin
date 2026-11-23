import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth-user.js';

/**
 * Rate limit counted per authenticated user, not per IP: every member
 * shares the gym's public IP (NAT), so an IP limit would make one
 * person's taps count against everyone.
 * Must run after JwtAuthGuard: `@UseGuards(JwtAuthGuard, UserThrottlerGuard)`.
 */
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Request): Promise<string> {
    const user = req.user as AuthUser | undefined;
    // Fallback to the IP only if the guard order is wrong; still limited
    return Promise.resolve(user ? `user:${user.userId}` : `ip:${req.ip}`);
  }
}
