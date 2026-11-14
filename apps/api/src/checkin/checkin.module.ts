import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { SettingsModule } from '../settings/settings.module.js';
import {
  CHECKIN_METHOD_STRATEGIES,
  type CheckinMethodStrategy,
} from './checkin-method.strategy.js';
import { CheckinController } from './checkin.controller.js';
import { CheckinService } from './checkin.service.js';
import { SimpleCheckinMethod } from './methods/simple.method.js';

@Module({
  imports: [
    SettingsModule,
    // Same setup as AuthModule: per-route limits, in-memory storage
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
  ],
  controllers: [CheckinController],
  providers: [
    CheckinService,
    SimpleCheckinMethod,
    // To add a method (QR, reception approval): register its class above
    // and add it to `inject`. CheckinService and other methods stay untouched.
    {
      provide: CHECKIN_METHOD_STRATEGIES,
      inject: [SimpleCheckinMethod],
      useFactory: (...strategies: CheckinMethodStrategy[]) => strategies,
    },
  ],
})
export class CheckinModule {}
