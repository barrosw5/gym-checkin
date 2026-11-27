import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { demoLoginSchema, type DemoLoginInput } from '@gym-checkin/shared';
import type { Response } from 'express';
import { setAuthCookie } from '../auth/auth-cookie.js';
import { AuthService } from '../auth/auth.service.js';
import { ApiZodBody } from '../common/api-docs.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { DemoAccessService } from './demo-access.service.js';

/** Per IP: the login page asks every 30 s, so this leaves plenty of room. */
export const DEMO_STATUS_RATE_LIMIT = { limit: 30, ttl: 60_000 };
export const DEMO_LOGIN_RATE_LIMIT = { limit: 10, ttl: 60_000 };

@ApiTags('demo')
@Controller('demo')
// No JwtAuthGuard: this is what a visitor sees before having a session
@UseGuards(ThrottlerGuard)
export class DemoController {
  constructor(
    private demo: DemoAccessService,
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Throttle({ default: DEMO_STATUS_RATE_LIMIT })
  @Get()
  getStatus() {
    return this.demo.getStatus();
  }

  @HttpCode(HttpStatus.OK)
  @Throttle({ default: DEMO_LOGIN_RATE_LIMIT })
  @ApiZodBody(demoLoginSchema)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(demoLoginSchema)) body: DemoLoginInput,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.demo.findAccount(body.role);
    const { access_token } = await this.auth.login(user);
    setAuthCookie(res, access_token, this.config.get('NODE_ENV') === 'production');
    return { message: 'Login successful' };
  }
}
