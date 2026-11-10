import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { HealthController } from './health/health.controller.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { AuthModule } from './auth/auth.module.js';
import { PrismaService } from './prisma/prisma.service.js';

@Module({
  imports: [
    // isGlobal: ConfigService can be injected anywhere without re-importing the module
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'web', 'dist'),
    }),
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
