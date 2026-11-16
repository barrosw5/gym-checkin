import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  userImportSchema,
  userUpdateSchema,
  type UserImportInput,
  type UserUpdate,
} from '@gym-checkin/shared';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { AdminUsersService } from './admin-users.service.js';

@Controller('admin/users')
// Accounts are the admin's job, not reception's
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private users: AdminUsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  // JSON body with the CSV text: no multipart upload dependency needed.
  // The response holds temporary passwords: never cache it
  @Post('import')
  @Header('Cache-Control', 'no-store')
  async import(@Body(new ZodValidationPipe(userImportSchema)) body: UserImportInput) {
    return { created: await this.users.import(body.csv) };
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(userUpdateSchema)) body: UserUpdate,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.users.update(id, body, admin);
  }
}
