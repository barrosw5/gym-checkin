import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module.js';
import { GymModule } from '../gym/gym.module.js';
import { DemoAccessService } from './demo-access.service.js';
import { DemoController } from './demo.controller.js';
import { DemoService } from './demo.service.js';

@Module({
  imports: [
    AuthModule,
    // GymModule: open screens learn when the demo changes the occupancy
    GymModule,
    // Same setup as AuthModule: per-route limits, in-memory storage
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
  ],
  controllers: [DemoController],
  providers: [DemoService, DemoAccessService],
})
export class DemoModule {}
