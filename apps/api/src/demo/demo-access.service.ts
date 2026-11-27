import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import type { DemoRole, DemoStatus } from '@gym-checkin/shared';
import { OccupancyService } from '../gym/occupancy.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** The public demo accounts of the README, one per role. */
export const DEMO_ACCOUNTS: Record<DemoRole, string> = {
  STUDENT: 'joaosilva',
  RECEPTION: 'rececao',
};

/** How long a public answer is reused: strangers cannot load the database. */
export const STATUS_CACHE_MS = 15_000;

/**
 * What the public demo offers without a password. Everything here is off
 * unless DEMO_MODE=true AND the database has no real member: on a real
 * install, a mistaken variable must not open the door to anyone.
 */
@Injectable()
export class DemoAccessService {
  private cached?: { status: DemoStatus; until: number };

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private occupancy: OccupancyService,
  ) {}

  async getStatus(now = Date.now()): Promise<DemoStatus> {
    if (this.cached && now < this.cached.until) return this.cached.status;
    const status: DemoStatus = (await this.isOpen())
      ? { enabled: true, occupancy: await this.occupancy.getOccupancy() }
      : { enabled: false };
    this.cached = { status, until: now + STATUS_CACHE_MS };
    return status;
  }

  /** The account to log into. Throws 404 when the demo is not open. */
  async findAccount(role: DemoRole) {
    const user = (await this.isOpen())
      ? await this.prisma.user.findUnique({
          where: { username: DEMO_ACCOUNTS[role] },
          select: { id: true, username: true, role: true, isDemo: true, active: true },
        })
      : null;
    // The row must really be that demo account, whatever the username says
    if (!user || !user.isDemo || !user.active || user.role !== role) {
      throw new NotFoundException('Demo access is not available');
    }
    return user;
  }

  private async isOpen(): Promise<boolean> {
    if (this.config.get<string>('DEMO_MODE') !== 'true') return false;
    const realStudents = await this.prisma.user.count({
      where: { role: Role.STUDENT, isDemo: false },
    });
    return realStudents === 0;
  }
}
