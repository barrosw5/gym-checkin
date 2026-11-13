import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

/**
 * Rate limit for POST /auth/login, counted per (IP, username) pair.
 *
 * Why not per IP only: every resident shares the residence's public IP (NAT),
 * so one IP-wide bucket would let a single person lock everyone out of login.
 * Keying by username too limits brute force against one account without
 * punishing the other residents on the same network.
 */
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Request): Promise<string> {
    // Guards run before validation pipes, so the body is still untrusted here
    const raw: unknown = req.body?.username;
    const username =
      typeof raw === 'string' ? raw.trim().toLowerCase() : '<invalid>';
    return Promise.resolve(`${req.ip}:${username}`);
  }
}
