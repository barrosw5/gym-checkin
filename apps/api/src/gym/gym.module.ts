import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module.js';
import { GymController } from './gym.controller.js';
import { OccupancyService } from './occupancy.service.js';

@Module({
  imports: [SettingsModule],
  controllers: [GymController],
  providers: [OccupancyService],
  // Check-in, checkout and auto-close call notifyChanged()
  exports: [OccupancyService],
})
export class GymModule {}
