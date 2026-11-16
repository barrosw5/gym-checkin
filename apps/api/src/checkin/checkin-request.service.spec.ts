import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OccupancyService } from '../gym/occupancy.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { SettingsService } from '../settings/settings.service.js';
import {
  CheckinRequestService,
  REQUEST_TTL_MS,
} from './checkin-request.service.js';

const NOW = new Date('2026-11-16T18:00:00Z');
const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

describe('CheckinRequestService', () => {
  const session = { findFirst: vi.fn(), create: vi.fn() };
  const checkinRequest = {
    updateMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  };
  const tx = { session, checkinRequest };
  // Array form resolves every op; callback form runs it with the tx client
  const $transaction = vi.fn((arg: unknown) =>
    typeof arg === 'function'
      ? (arg as (t: typeof tx) => Promise<unknown>)(tx)
      : Promise.all(arg as Promise<unknown>[]),
  );
  const getSettings = vi.fn();
  const notifyOccupancy = vi.fn();
  let service: CheckinRequestService;
  let changes: number;

  beforeEach(() => {
    vi.clearAllMocks();
    getSettings.mockResolvedValue({
      enabledMethods: ['RECEPTION_APPROVAL'],
    });
    session.findFirst.mockResolvedValue(null);
    checkinRequest.updateMany.mockResolvedValue({ count: 1 });
    checkinRequest.findUnique.mockResolvedValue({ userId: 'u1' });
    service = new CheckinRequestService(
      { session, checkinRequest, $transaction } as unknown as PrismaService,
      { get: getSettings } as unknown as SettingsService,
      { notifyChanged: notifyOccupancy } as unknown as OccupancyService,
    );
    // Count change notifications through the private subject
    changes = 0;
    service['changed'].subscribe(() => changes++);
  });

  describe('create', () => {
    it('creates a pending request that expires in 2 minutes', async () => {
      const created = { id: 'r1', status: 'PENDING' };
      checkinRequest.create.mockResolvedValue(created);

      await expect(service.create('u1', NOW)).resolves.toBe(created);
      expect(checkinRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            userId: 'u1',
            createdAt: NOW,
            expiresAt: new Date(NOW.getTime() + REQUEST_TTL_MS),
          },
        }),
      );
      expect(changes).toBe(1);
    });

    it("first expires the user's old pending request (it would block the index)", async () => {
      checkinRequest.create.mockResolvedValue({});

      await service.create('u1', NOW);

      expect(checkinRequest.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', status: 'PENDING', expiresAt: { lte: NOW } },
        data: { status: 'EXPIRED' },
      });
    });

    it('returns 403 when the method is disabled', async () => {
      getSettings.mockResolvedValue({ enabledMethods: ['SCREEN_QR'] });

      await expect(service.create('u1', NOW)).rejects.toThrow(ForbiddenException);
      expect(checkinRequest.create).not.toHaveBeenCalled();
    });

    it('returns 409 when the student is already in the gym', async () => {
      session.findFirst.mockResolvedValue({ id: 's1' });

      await expect(service.create('u1', NOW)).rejects.toThrow(ConflictException);
      expect(checkinRequest.create).not.toHaveBeenCalled();
    });

    it('returns 409 for a second pending request (double tap)', async () => {
      checkinRequest.create.mockRejectedValue(uniqueViolation());

      await expect(service.create('u1', NOW)).rejects.toThrow(
        'You already have a pending request',
      );
      expect(changes).toBe(0);
    });
  });

  describe('getLatest', () => {
    it('shows a pending request past its expiry as EXPIRED', async () => {
      checkinRequest.findFirst.mockResolvedValue({
        id: 'r1',
        status: 'PENDING',
        expiresAt: new Date(NOW.getTime() - 1),
      });

      await expect(service.getLatest('u1', NOW)).resolves.toMatchObject({
        status: 'EXPIRED',
      });
    });

    it('returns a decided request as it is, and null when there is none', async () => {
      const approved = { id: 'r1', status: 'APPROVED', expiresAt: NOW };
      checkinRequest.findFirst.mockResolvedValueOnce(approved);
      checkinRequest.findFirst.mockResolvedValueOnce(null);

      await expect(service.getLatest('u1', NOW)).resolves.toBe(approved);
      await expect(service.getLatest('u1', NOW)).resolves.toBeNull();
    });
  });

  it('lists only still-valid pending requests, oldest first, with name and room only', async () => {
    await service.listPending(NOW);

    expect(checkinRequest.findMany).toHaveBeenCalledWith({
      where: { status: 'PENDING', expiresAt: { gt: NOW } },
      orderBy: { createdAt: 'asc' },
      select: expect.objectContaining({
        user: { select: { name: true, room: true } },
      }),
    });
  });

  describe('approve', () => {
    it('marks it approved and opens the session in one transaction', async () => {
      await service.approve('r1', 'staff1', NOW);

      expect(checkinRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'r1', status: 'PENDING', expiresAt: { gt: NOW } },
        data: { status: 'APPROVED', decidedById: 'staff1', decidedAt: NOW },
      });
      expect(session.create).toHaveBeenCalledWith({
        data: { userId: 'u1', entryAt: NOW, method: 'RECEPTION_APPROVAL' },
      });
      expect(changes).toBe(1);
      expect(notifyOccupancy).toHaveBeenCalledOnce();
    });

    it('returns 404 for an unknown request', async () => {
      checkinRequest.findUnique.mockResolvedValue(null);

      await expect(service.approve('r1', 'staff1', NOW)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns 409 when already decided or expired (two staff clicking at once)', async () => {
      checkinRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.approve('r1', 'staff1', NOW)).rejects.toThrow(
        'This request is no longer pending',
      );
      expect(session.create).not.toHaveBeenCalled();
      expect(notifyOccupancy).not.toHaveBeenCalled();
    });

    it('returns 409 when the student is already inside (transaction rolls back)', async () => {
      session.create.mockRejectedValue(uniqueViolation());

      await expect(service.approve('r1', 'staff1', NOW)).rejects.toThrow(
        'The student is already in the gym',
      );
      expect(notifyOccupancy).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('marks it rejected without opening a session', async () => {
      await service.reject('r1', 'staff1', NOW);

      expect(checkinRequest.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'REJECTED', decidedById: 'staff1', decidedAt: NOW },
        }),
      );
      expect(session.create).not.toHaveBeenCalled();
      expect(changes).toBe(1);
    });

    it('returns 409 when it is no longer pending', async () => {
      checkinRequest.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.reject('r1', 'staff1', NOW)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
