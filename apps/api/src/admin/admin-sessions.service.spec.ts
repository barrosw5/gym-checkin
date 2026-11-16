import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../auth/auth-user.js';
import type { OccupancyService } from '../gym/occupancy.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AdminSessionsService } from './admin-sessions.service.js';

const NOW = new Date('2026-11-16T20:00:00Z');
const ENTRY = new Date('2026-11-16T18:00:00Z');
const reception: AuthUser = { userId: 'staff', username: 'rececao', role: 'RECEPTION' };
const admin: AuthUser = { userId: 'adm', username: 'admin', role: 'ADMIN' };

describe('AdminSessionsService', () => {
  const session = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    updateMany: vi.fn(),
  };
  const notifyChanged = vi.fn();
  let service: AdminSessionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    session.findUnique.mockResolvedValue({ entryAt: ENTRY, exitAt: null });
    session.updateMany.mockResolvedValue({ count: 1 });
    service = new AdminSessionsService(
      { session } as unknown as PrismaService,
      { notifyChanged } as unknown as OccupancyService,
    );
  });

  describe('list', () => {
    it('lists open sessions', async () => {
      await service.list({ open: 'true' });

      expect(session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { exitAt: null } }),
      );
    });

    it('lists a time range [from, to)', async () => {
      await service.list({ from: '2026-11-16T00:00:00Z', to: '2026-11-17T00:00:00Z' });

      expect(session.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            entryAt: {
              gte: new Date('2026-11-16T00:00:00Z'),
              lt: new Date('2026-11-17T00:00:00Z'),
            },
          },
        }),
      );
    });
  });

  describe('correct', () => {
    it('closes an open session as RECEPTION and updates the live counter', async () => {
      await service.correct('s1', { exitAt: '2026-11-16T19:00:00Z' }, reception, NOW);

      expect(session.updateMany).toHaveBeenCalledWith({
        // Only if it is still open, as we read it
        where: { id: 's1', exitAt: null },
        data: {
          entryAt: ENTRY,
          exitAt: new Date('2026-11-16T19:00:00Z'),
          closedBy: 'RECEPTION',
        },
      });
      expect(notifyChanged).toHaveBeenCalledOnce();
    });

    it('records ADMIN as the closer when an admin does it', async () => {
      await service.correct('s1', { exitAt: '2026-11-16T19:00:00Z' }, admin, NOW);

      expect(session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ closedBy: 'ADMIN' }),
        }),
      );
    });

    it('fixes only the entry time without touching closedBy or the counter', async () => {
      await service.correct('s1', { entryAt: '2026-11-16T17:30:00Z' }, reception, NOW);

      expect(session.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { entryAt: new Date('2026-11-16T17:30:00Z'), exitAt: null },
        }),
      );
      expect(notifyChanged).not.toHaveBeenCalled();
    });

    it('returns 404 for an unknown session', async () => {
      session.findUnique.mockResolvedValue(null);

      await expect(
        service.correct('s1', { exitAt: '2026-11-16T19:00:00Z' }, reception, NOW),
      ).rejects.toThrow(NotFoundException);
    });

    it.each([
      ['an exit before the entry', { exitAt: '2026-11-16T17:00:00Z' }],
      ['an exit in the future', { exitAt: '2026-11-16T21:00:00Z' }],
      ['an entry in the future', { entryAt: '2026-11-16T21:00:00Z' }],
    ])('returns 400 for %s', async (_case, input) => {
      await expect(service.correct('s1', input, reception, NOW)).rejects.toThrow(
        BadRequestException,
      );
      expect(session.updateMany).not.toHaveBeenCalled();
    });

    it('returns 409 when the student checked out meanwhile (no silent overwrite)', async () => {
      session.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.correct('s1', { exitAt: '2026-11-16T19:00:00Z' }, reception, NOW),
      ).rejects.toThrow(ConflictException);
      expect(notifyChanged).not.toHaveBeenCalled();
    });
  });
});
