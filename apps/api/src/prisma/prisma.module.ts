import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

/**
 * Single PrismaService (one connection pool) for the whole app.
 * Global because almost every domain module needs the database;
 * keep @Global() for infrastructure only, not for domain modules.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
