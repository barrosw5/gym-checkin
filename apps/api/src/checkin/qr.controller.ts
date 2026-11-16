import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { QrTokenService } from './qr-token.service.js';

@Controller('admin/qr')
// Only staff may read the token: a student with it could check in from bed
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECEPTION, Role.ADMIN)
export class QrController {
  constructor(private qrTokens: QrTokenService) {}

  @Get('current')
  // A token must never sit in a browser or proxy cache
  @Header('Cache-Control', 'no-store')
  current() {
    return this.qrTokens.current();
  }
}
