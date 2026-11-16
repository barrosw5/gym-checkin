import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { GymModule } from '../gym/gym.module.js';
import { SettingsModule } from '../settings/settings.module.js';
import { AdminRequestsController } from './admin-requests.controller.js';
import { AutoCloseService } from './auto-close.service.js';
import { CheckinRequestController } from './checkin-request.controller.js';
import { CheckinRequestService } from './checkin-request.service.js';
import {
  CHECKIN_METHOD_STRATEGIES,
  type CheckinMethodStrategy,
} from './checkin-method.strategy.js';
import { CheckinController } from './checkin.controller.js';
import { CheckinService } from './checkin.service.js';
import { ScreenQrCheckinMethod } from './methods/screen-qr.method.js';
import { SimpleCheckinMethod } from './methods/simple.method.js';
import { QrController } from './qr.controller.js';
import { QrTokenService } from './qr-token.service.js';

@Module({
  imports: [
    SettingsModule,
    GymModule,
    // Same setup as AuthModule: per-route limits, in-memory storage
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
  ],
  controllers: [
    CheckinController,
    CheckinRequestController,
    AdminRequestsController,
    QrController,
  ],
  providers: [
    CheckinService,
    CheckinRequestService,
    AutoCloseService,
    QrTokenService,
    SimpleCheckinMethod,
    ScreenQrCheckinMethod,
    // To add a method (QR, reception approval): register its class above
    // and add it to `inject`. CheckinService and other methods stay untouched.
    {
      provide: CHECKIN_METHOD_STRATEGIES,
      inject: [SimpleCheckinMethod, ScreenQrCheckinMethod],
      useFactory: (...strategies: CheckinMethodStrategy[]) => strategies,
    },
  ],
})
export class CheckinModule {}
