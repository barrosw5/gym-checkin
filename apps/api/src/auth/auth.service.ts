import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/** A user as it may leave the service: never with the password hash. */
export type SafeUser = Omit<User, 'passwordHash'>;

// One message for every failed login, so responses don't reveal
// whether a username exists or an account is inactive (user enumeration)
const INVALID_CREDENTIALS = 'Invalid credentials';

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

  async login(user: any) {
    // Generate the JWT "card" with user ID and role
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Single source of truth for "may this user still use their session?".
   * Called on every authenticated request, so a deactivated user is locked
   * out immediately instead of when their JWT expires.
   */
  async getActiveUser(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.active) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    return toSafeUser(user);
  }

  async getProfile(userId: string): Promise<SafeUser> {
    return this.getActiveUser(userId);
  }
}

function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
