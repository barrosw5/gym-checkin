import { ApiZodBody, ApiZodQuery } from '../common/api-docs.js';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  sessionCorrectionSchema,
  sessionsQuerySchema,
  type SessionCorrection,
  type SessionsQuery,
} from '@gym-checkin/shared';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AdminSessionsService } from './admin-sessions.service.js';

@ApiTags('reception')
@ApiCookieAuth()
@Controller('admin/sessions')
// Individual sessions are personal data: reception/admin only (CLAUDE.md)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECEPTION, Role.ADMIN)
export class AdminSessionsController {
  constructor(private sessions: AdminSessionsService) {}

  // ?open=true, or ?from=...&to=... (ISO instants with offset)
  @ApiZodQuery(sessionsQuerySchema)
  @Get()
  list(@Query(new ZodValidationPipe(sessionsQuerySchema)) query: SessionsQuery) {
    return this.sessions.list(query);
  }

  @ApiZodBody(sessionCorrectionSchema)
  @Patch(':id')
  correct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(sessionCorrectionSchema)) body: SessionCorrection,
    @CurrentUser() staff: AuthUser,
  ) {
    return this.sessions.correct(id, body, staff);
  }
}
