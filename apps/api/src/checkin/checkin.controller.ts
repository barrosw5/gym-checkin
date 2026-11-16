import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { checkinSchema, type CheckinInput } from '@gym-checkin/shared';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserThrottlerGuard } from '../common/user-throttler.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { CheckinService } from './checkin.service.js';

/** 10 per minute per user: generous for real use, stops scripted spam. */
export const CHECKIN_RATE_LIMIT = { limit: 10, ttl: 60_000 };

@Controller()
// JWT first: the throttler counts per user, so it needs req.user.
// Students only: staff run the gym, they don't train in it through the app
@UseGuards(JwtAuthGuard, RolesGuard, UserThrottlerGuard)
@Roles(Role.STUDENT)
export class CheckinController {
  constructor(private checkinService: CheckinService) {}

  // 201 Created (Nest's default for POST): a new session resource is created
  @Throttle({ default: CHECKIN_RATE_LIMIT })
  @Post('checkin')
  checkIn(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(checkinSchema)) body: CheckinInput,
  ) {
    // The user comes from the cookie, never from the body: no one can
    // check in someone else
    return this.checkinService.checkIn(user.userId, body);
  }

  @Get('checkin/methods')
  async methods() {
    return { enabledMethods: await this.checkinService.getEnabledMethods() };
  }

  // Wrapped in an object: a bare `null` body is ambiguous for clients.
  // Not throttled per route: a read, covered by the module's default limit
  @Get('checkin/current')
  async current(@CurrentUser() user: AuthUser) {
    return { session: await this.checkinService.getOpenSession(user.userId) };
  }

  // 200, not 201: it updates an existing session instead of creating one
  @Throttle({ default: CHECKIN_RATE_LIMIT })
  @HttpCode(HttpStatus.OK)
  @Post('checkout')
  checkOut(@CurrentUser() user: AuthUser) {
    return this.checkinService.checkOut(user.userId);
  }
}
