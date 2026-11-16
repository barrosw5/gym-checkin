import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { JwtPayload } from './auth-user.js';

/** A user as it may leave the service: never with the password hash. */
export type SafeUser = Omit<User, 'passwordHash'>;

// One message for every failed login, so responses don't reveal
// whether a username exists or an account is inactive (user enumeration)
const INVALID_CREDENTIALS = 'Invalid credentials';
const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException(INVALID_CREDENTIALS);

    // Compare the password before checking `active`: bcrypt always runs for an
    // existing user, so an inactive account doesn't answer faster (timing leak)
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch || !user.active) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    return toSafeUser(user);
  }

  // Pick: only the fields the token needs, so callers can't pass a full User by mistake
  async login(user: Pick<SafeUser, 'id' | 'username' | 'role'>) {
    // Generate the JWT "card" with user ID and role
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Single source of truth for "may this user still use their session?".
   * Called on every authenticated request, so a deactivated user is locked
   * out immediately instead of when their JWT expires.
   */
  async getActiveUser(userId: string, issuedAt?: number): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    // A token from before the last password change: another device (or a
    // stolen cookie) is logged out the moment the password changes
    if (
      issuedAt !== undefined &&
      user.passwordChangedAt &&
      issuedAt * 1000 < user.passwordChangedAt.getTime()
    ) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    return toSafeUser(user);
  }

  /**
   * Changes the password after checking the current one. Demo accounts are
   * public, so they can't: a visitor would lock everyone else out.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    now = new Date(),
  ): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    if (user.isDemo) {
      throw new ForbiddenException('Demo accounts cannot change their password');
    }
    // 403, not 401: the session is fine, this one action is refused
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(newPassword, BCRYPT_ROUNDS),
        mustChangePassword: false,
        // Rounded down to the second: JWT iat has second precision, so the
        // token issued right after this (same device) is never "older"
        passwordChangedAt: new Date(Math.floor(now.getTime() / 1000) * 1000),
      },
    });
    return toSafeUser(updated);
  }

  async getProfile(userId: string): Promise<SafeUser> {
    return this.getActiveUser(userId);
  }
}

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
