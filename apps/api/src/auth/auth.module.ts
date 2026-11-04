import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  imports: [
    JwtModule.register({
      global: true, // Available everywhere
      secret: 'SUPER_SECRET_KEY_CHANGE_ME_IN_PRODUCTION', // We will fix this later
      signOptions: { expiresIn: '7d' }, // The "card" expires in 7 days
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
