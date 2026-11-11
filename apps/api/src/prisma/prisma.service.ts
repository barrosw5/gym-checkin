import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  // Close the pool on shutdown (needs app.enableShutdownHooks() in main.ts)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
