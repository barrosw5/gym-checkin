import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy.js';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    PassportModule,
    // Registers the rate-limit storage and default limits for this module.
    // The guard is applied per route (login), not globally. In-memory storage
    // is fine while the API runs as a single Render instance.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    JwtModule.registerAsync({
      global: true, // Available everywhere
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // The "card" expires in 7 days
      }),
    }),
  ],
  controllers: [AuthController],
  // PrismaService comes from the global PrismaModule (one shared instance)
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
