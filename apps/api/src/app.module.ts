import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { API_PREFIX } from '@gym-checkin/shared';
import { validateEnv } from './config/env.validation.js';
import { HealthController } from './health/health.controller.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // isGlobal: ConfigService can be injected anywhere without re-importing the module
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'web', 'dist'),
      // Unknown /api routes must return a JSON 404, never the SPA's index.html
      exclude: [`/${API_PREFIX}/{*path}`],
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
