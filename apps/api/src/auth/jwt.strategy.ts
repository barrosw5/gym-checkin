import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from './auth.service.js';

import type { AuthUser, JwtPayload } from './auth-user.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Runs after the signature and expiry are verified. A valid signature is not
  // enough: the user may have been deactivated since the token was issued.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.authService.getActiveUser(payload.sub);
    // Role from the DB, not from the token: role changes apply immediately
    return { userId: user.id, username: user.username, role: user.role };
  }
}
