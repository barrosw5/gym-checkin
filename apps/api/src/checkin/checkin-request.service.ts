import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleDestroy,
} from '@nestjs/common';
import {
  CheckinMethod,
  CheckinRequestStatus,
  Prisma,
  SessionMethod,
} from '@prisma/client';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  from,
  interval,
  merge,
  share,
  switchMap,
} from 'rxjs';
import { OccupancyService } from '../gym/occupancy.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SettingsService } from '../settings/settings.service.js';

/** How long reception has to answer (ROADMAP 5.2). */
export const REQUEST_TTL_MS = 2 * 60_000;
/** Re-sends the pending list so expired requests drop off without a change. */
export const PENDING_REFRESH_MS = 10_000;

const UNIQUE_VIOLATION = 'P2002';

/** A student's own request, as they see it. */
export interface MyCheckinRequest {
  id: string;
  status: CheckinRequestStatus;
  createdAt: Date;
  expiresAt: Date;
}

/** What reception needs to decide: the minimum personal data (GDPR). */
export interface PendingCheckinRequest {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  user: { name: string; room: string };
}

const MY_REQUEST_SELECT = {
  id: true,
  status: true,
  createdAt: true,
  expiresAt: true,
} as const;

const isUniqueViolation = (err: unknown) =>
  err instanceof Prisma.PrismaClientKnownRequestError &&
  err.code === UNIQUE_VIOLATION;

/**
 * Method B (ROADMAP 5.2): the student asks, reception approves or rejects.
 * Not a CheckinMethodStrategy: the session is opened by a staff member's
 * decision, not by the student's own request carrying a proof.
 */
@Injectable()
export class CheckinRequestService implements OnModuleDestroy {
  private readonly logger = new Logger(CheckinRequestService.name);
  private readonly changed = new Subject<void>();
  private readonly shutdown = new Subject<void>();

  /** Emits once when the app shuts down (ends open SSE streams). */
  readonly shutdown$: Observable<void> = this.shutdown.asObservable();

  /**
   * Pending list after every change (and every few seconds, so expired
   * requests disappear). share(): one query for all reception screens;
   * the timer only runs while someone is listening.
   */
  readonly pending$: Observable<PendingCheckinRequest[]> = merge(
    this.changed,
    interval(PENDING_REFRESH_MS),
  ).pipe(
    switchMap(() =>
      from(this.listPending()).pipe(
        catchError((err: unknown) => {
          this.logger.error('Failed to list pending requests', err);
          return EMPTY;
        }),
      ),
    ),
    share(),
  );

  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
    private occupancy: OccupancyService,
  ) {}

  async create(userId: string, now = new Date()): Promise<MyCheckinRequest> {
    const { enabledMethods } = await this.settings.get();
    if (!enabledMethods.includes(CheckinMethod.RECEPTION_APPROVAL)) {
      throw new ForbiddenException('Check-in method not available');
    }
    // UX only (the session index is the real rule, checked on approval):
    // don't bother reception with someone who is already inside
    const open = await this.prisma.session.findFirst({
      where: { userId, exitAt: null },
      select: { id: true },
    });
    if (open) throw new ConflictException('You are already checked in');

    try {
      const [, request] = await this.prisma.$transaction([
        // An old PENDING past its expiry would block the unique index:
        // mark it EXPIRED first, in the same transaction
        this.prisma.checkinRequest.updateMany({
          where: {
            userId,
            status: CheckinRequestStatus.PENDING,
            expiresAt: { lte: now },
          },
          data: { status: CheckinRequestStatus.EXPIRED },
        }),
        this.prisma.checkinRequest.create({
          data: {
            userId,
            createdAt: now,
            expiresAt: new Date(now.getTime() + REQUEST_TTL_MS),
          },
          select: MY_REQUEST_SELECT,
        }),
      ]);
      this.changed.next();
      return request;
    } catch (err) {
      // one_pending_request_per_user: a double tap can't create two requests
      if (isUniqueViolation(err)) {
        throw new ConflictException('You already have a pending request');
      }
      throw err;
    }
  }

  /** The user's latest request, or null. Read-only: expiry is computed. */
  async getLatest(
    userId: string,
    now = new Date(),
  ): Promise<MyCheckinRequest | null> {
    const request = await this.prisma.checkinRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: MY_REQUEST_SELECT,
    });
    if (
      request?.status === CheckinRequestStatus.PENDING &&
      request.expiresAt <= now
    ) {
      return { ...request, status: CheckinRequestStatus.EXPIRED };
    }
    return request;
  }

  /** Still-valid pending requests, oldest first (first come, first served). */
  listPending(now = new Date()): Promise<PendingCheckinRequest[]> {
    return this.prisma.checkinRequest.findMany({
      where: { status: CheckinRequestStatus.PENDING, expiresAt: { gt: now } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
        user: { select: { name: true, room: true } },
      },
    });
  }

  /**
   * Approves and opens the session in one transaction: either both happen
   * or neither (e.g. the student is already inside → nothing changes).
   */
  async approve(id: string, staffId: string, now = new Date()): Promise<void> {
    const request = await this.findOrThrow(id);
    try {
      await this.prisma.$transaction(async (tx) => {
        await this.decide(tx, id, staffId, CheckinRequestStatus.APPROVED, now);
        await tx.session.create({
          data: {
            userId: request.userId,
            entryAt: now,
            method: SessionMethod.RECEPTION_APPROVAL,
          },
        });
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('The student is already in the gym');
      }
      throw err;
    }
    this.changed.next();
    this.occupancy.notifyChanged();
  }

  async reject(id: string, staffId: string, now = new Date()): Promise<void> {
    await this.findOrThrow(id);
    await this.decide(
      this.prisma,
      id,
      staffId,
      CheckinRequestStatus.REJECTED,
      now,
    );
    this.changed.next();
  }

  onModuleDestroy(): void {
    this.shutdown.next();
    this.shutdown.complete();
    this.changed.complete();
  }

  private async findOrThrow(id: string) {
    const request = await this.prisma.checkinRequest.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  /**
   * Conditional update ("only if still pending and not expired"): if two
   * staff members click at once, or the request expired, count is 0 and the
   * second decision gets a 409 instead of overwriting the first.
   */
  private async decide(
    db: Prisma.TransactionClient,
    id: string,
    staffId: string,
    status: typeof CheckinRequestStatus.APPROVED | typeof CheckinRequestStatus.REJECTED,
    now: Date,
  ): Promise<void> {
    const { count } = await db.checkinRequest.updateMany({
      where: { id, status: CheckinRequestStatus.PENDING, expiresAt: { gt: now } },
      data: { status, decidedById: staffId, decidedAt: now },
    });
    if (count === 0) {
      throw new ConflictException('This request is no longer pending');
    }
  }
}
