import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  changePasswordSchema,
  loginSchema,
  type ChangePasswordInput,
  type LoginInput,
} from '@gym-checkin/shared';
import { UserThrottlerGuard } from '../common/user-throttler.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';
import type { AuthUser } from './auth-user.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Throttle } from '@nestjs/throttler';
import { LoginThrottlerGuard } from './login-throttler.guard.js';
import { AUTH_COOKIE } from './auth.constants.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { ApiZodBody } from '../common/api-docs.js';

/** 5 attempts per minute per (IP, username): enough for typos, not for guessing. */
export const LOGIN_RATE_LIMIT = { limit: 5, ttl: 60_000 };

/** Same budget as login: it also checks a password (brute-force target). */
export const PASSWORD_CHANGE_RATE_LIMIT = { limit: 5, ttl: 60_000 };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  // Throttle first: limit attempts before any validation or bcrypt work
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: LOGIN_RATE_LIMIT })
  @ApiZodBody(loginSchema)
  @Post('login')
  async login(
    // Validated before this method runs: invalid bodies get a 400
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    await this.setAuthCookie(res, user);
    return { message: 'Login successful', user };
  }

  @HttpCode(HttpStatus.OK)
  // JWT first: the throttler counts per user, so it needs req.user
  @UseGuards(JwtAuthGuard, UserThrottlerGuard)
  @Throttle({ default: PASSWORD_CHANGE_RATE_LIMIT })
  @ApiCookieAuth()
  @ApiZodBody(changePasswordSchema)
  @Post('password')
  async changePassword(
    @CurrentUser() current: AuthUser,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.changePassword(
      current.userId,
      body.currentPassword,
      body.newPassword,
    );
    // Older tokens are now rejected: give this device a fresh one so it
    // stays logged in while every other device is logged out
    await this.setAuthCookie(res, user);
    return { message: 'Password changed', user };
  }

  /** Signs a JWT and sets it as an httpOnly cookie (never readable by JS). */
  private async setAuthCookie(
    res: Response,
    user: Parameters<AuthService['login']>[0],
  ) {
    const token = await this.authService.login(user);
    res.cookie(AUTH_COOKIE, token.access_token, {
      httpOnly: true, // JS cannot read it
      // HTTPS only in production (localhost dev runs on plain HTTP)
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(AUTH_COOKIE);
    return { message: 'Logout successful' };
  }
}
