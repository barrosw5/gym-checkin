import { Module } from '@nestjs/common';
import { GymModule } from '../gym/gym.module.js';
import { DemoService } from './demo.service.js';

@Module({
  // GymModule: open screens learn when the demo changes the occupancy
  imports: [GymModule],
  providers: [DemoService],
})
export class DemoModule {}
