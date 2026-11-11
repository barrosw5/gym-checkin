import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
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
