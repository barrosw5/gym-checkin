import { Module } from '@nestjs/common';
import { GymModule } from '../gym/gym.module.js';
import { AdminSessionsController } from './admin-sessions.controller.js';
import { AdminSessionsService } from './admin-sessions.service.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';

/** Staff tools: session corrections (reception/admin), accounts (admin). */
@Module({
  // Closing a session from here must update the live occupancy counter
  imports: [GymModule],
  controllers: [AdminSessionsController, AdminUsersController],
  providers: [AdminSessionsService, AdminUsersService],
})
export class AdminModule {}
