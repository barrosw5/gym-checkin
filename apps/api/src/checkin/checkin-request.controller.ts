import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { UserThrottlerGuard } from '../common/user-throttler.guard.js';
import { CHECKIN_RATE_LIMIT } from './checkin.controller.js';
import { CheckinRequestService } from './checkin-request.service.js';

/** The student's side of method B (students only, like check-in). */
@ApiTags('checkin')
@ApiCookieAuth()
@Controller('checkin/requests')
@UseGuards(JwtAuthGuard, RolesGuard, UserThrottlerGuard)
@Roles(Role.STUDENT)
export class CheckinRequestController {
  constructor(private requests: CheckinRequestService) {}

  // 201: a new request resource. Same limit as check-in (spam protection)
  @Throttle({ default: CHECKIN_RATE_LIMIT })
  @Post()
  create(@CurrentUser() user: AuthUser) {
    return this.requests.create(user.userId);
  }

  // Polled every few seconds while the student waits
  @Get('current')
  async current(@CurrentUser() user: AuthUser) {
    return { request: await this.requests.getLatest(user.userId) };
  }
}
