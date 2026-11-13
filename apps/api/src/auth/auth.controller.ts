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
import { loginSchema, type LoginInput } from '@gym-checkin/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AuthService } from './auth.service.js';
import type { Response } from 'express';
import type { AuthUser } from './auth-user.js';
import { CurrentUser } from './current-user.decorator.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Throttle } from '@nestjs/throttler';
import { LoginThrottlerGuard } from './login-throttler.guard.js';

/** 5 attempts per minute per (IP, username): enough for typos, not for guessing. */
export const LOGIN_RATE_LIMIT = { limit: 5, ttl: 60_000 };

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
    const token = await this.authService.login(user);

    // Set the JWT as an HttpOnly cookie
    res.cookie('Authentication', token.access_token, {
      httpOnly: true, // JS cannot read it
      // HTTPS only in production (localhost dev runs on plain HTTP)
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
    });

    return { message: 'Login successful', user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('Authentication');
    return { message: 'Logout successful' };
  }
}
