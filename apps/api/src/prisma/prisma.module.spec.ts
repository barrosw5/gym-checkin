import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { AuthService } from '../auth/auth.service.js';
import { PrismaModule } from './prisma.module.js';
import { PrismaService } from './prisma.service.js';

describe('PrismaModule', () => {
  it('shares a single PrismaService instance across modules', async () => {
    // compile() without init(): builds the DI graph without connecting to the DB
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'x'.repeat(32) })],
        }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    const rootPrisma = moduleRef.get(PrismaService);
    const authService = moduleRef.get(AuthService);
    // Reads the private field on purpose: the DI wiring is what is under test
    const authPrisma = (authService as unknown as { prisma: PrismaService })
      .prisma;

    // A second instance would mean a second connection pool
    expect(authPrisma).toBe(rootPrisma);
  });
});
