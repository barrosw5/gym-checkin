import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  type MessageEvent,
  Param,
  ParseUUIDPipe,
  Post,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  type Observable,
  defer,
  interval,
  map,
  merge,
  takeUntil,
} from 'rxjs';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { HEARTBEAT_MS } from '../gym/gym.controller.js';
import { CheckinRequestService } from './checkin-request.service.js';

/** Reception's side of method B. Names and rooms: staff only. */
@ApiTags('reception')
@ApiCookieAuth()
@Controller('admin/requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECEPTION, Role.ADMIN)
export class AdminRequestsController {
  constructor(private requests: CheckinRequestService) {}

  @Get()
  list() {
    return this.requests.listPending();
  }

  /** SSE: the pending list now, then again after every change. */
  @Sse('stream')
  stream(): Observable<MessageEvent> {
    const list$ = merge(
      defer(() => this.requests.listPending()),
      this.requests.pending$,
    ).pipe(map((data): MessageEvent => ({ data })));
    const heartbeat$ = interval(HEARTBEAT_MS).pipe(
      map((): MessageEvent => ({ type: 'ping', data: '' })),
    );
    return merge(list$, heartbeat$).pipe(takeUntil(this.requests.shutdown$));
  }

  // 200, not 201: it changes an existing request. ParseUUIDPipe: a malformed
  // id is a 400 before any DB query
  @HttpCode(HttpStatus.OK)
  @Post(':id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.requests.approve(id, user.userId);
    return { status: 'APPROVED' };
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    await this.requests.reject(id, user.userId);
    return { status: 'REJECTED' };
  }
}
