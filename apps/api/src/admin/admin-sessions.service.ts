import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClosedBy, Role } from '@prisma/client';
import type { SessionCorrection, SessionsQuery } from '@gym-checkin/shared';
import type { AuthUser } from '../auth/auth-user.js';
import { OccupancyService } from '../gym/occupancy.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

/** Upper bound per list: a day in a small gym is far below this. */
const MAX_SESSIONS = 500;

const SESSION_SELECT = {
  id: true,
  entryAt: true,
  exitAt: true,
  method: true,
  closedBy: true,
  // Minimum personal data for reception to recognise the person (GDPR)
  user: { select: { name: true, room: true } },
} as const;

/** Reception/admin view of individual sessions (CLAUDE.md: staff only). */
@Injectable()
export class AdminSessionsService {
  constructor(
    private prisma: PrismaService,
    private occupancy: OccupancyService,
  ) {}

  list(query: SessionsQuery) {
    return this.prisma.session.findMany({
      where:
        'open' in query
          ? { exitAt: null }
          : { entryAt: { gte: new Date(query.from), lt: new Date(query.to) } },
      orderBy: { entryAt: 'desc' },
      take: MAX_SESSIONS,
      select: SESSION_SELECT,
    });
  }

  /**
   * Fixes the times of a session, or closes it (exitAt on an open session,
   * e.g. the key was handed back). closedBy records which role did it.
   */
  async correct(
    id: string,
    input: SessionCorrection,
    staff: AuthUser,
    now = new Date(),
  ) {
    const current = await this.prisma.session.findUnique({
      where: { id },
      select: { entryAt: true, exitAt: true },
    });
    if (!current) throw new NotFoundException('Session not found');

    const entryAt = input.entryAt ? new Date(input.entryAt) : current.entryAt;
    const exitAt = input.exitAt ? new Date(input.exitAt) : current.exitAt;
    // Friendly 400s; the DB CHECK (exit >= entry) is the last line of defence
    if (entryAt > now || (exitAt && exitAt > now)) {
      throw new BadRequestException('Times cannot be in the future');
    }
    if (exitAt && exitAt < entryAt) {
      throw new BadRequestException('The exit must be after the entry');
    }

    // Conditional update: if the student checked out (or auto-close ran)
    // since we read the session, count is 0 and staff gets a 409 to reload,
    // instead of silently overwriting what just happened
    const { count } = await this.prisma.session.updateMany({
      where: { id, exitAt: current.exitAt },
      data: {
        entryAt,
        exitAt,
        ...(input.exitAt && {
          closedBy: staff.role === Role.ADMIN ? ClosedBy.ADMIN : ClosedBy.RECEPTION,
        }),
      },
    });
    if (count === 0) {
      throw new ConflictException('The session changed meanwhile, reload it');
    }

    // Closing an open session changes how many people are inside
    if (current.exitAt === null && exitAt !== null) {
      this.occupancy.notifyChanged();
    }
    return this.prisma.session.findUniqueOrThrow({
      where: { id },
      select: SESSION_SELECT,
    });
  }
}
