import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { CheckinMethod, Prisma } from '@prisma/client';
import { CHECKIN_METHODS } from '@gym-checkin/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { SettingsService } from '../settings/settings.service.js';
import type { CheckinMethodStrategy } from './checkin-method.strategy.js';
import { CheckinService } from './checkin.service.js';

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

describe('CheckinService', () => {
  const create = vi.fn();
  const findFirst = vi.fn();
  const updateMany = vi.fn();
  const getSettings = vi.fn();
  const verify = vi.fn();
  const simple: CheckinMethodStrategy = { method: 'SIMPLE', verify };
  let service: CheckinService;

  beforeEach(() => {
    vi.resetAllMocks();
    getSettings.mockResolvedValue({ enabledMethods: ['SIMPLE'] });
    verify.mockResolvedValue(undefined);
    service = new CheckinService(
      { session: { create, findFirst, updateMany } } as unknown as PrismaService,
      { get: getSettings } as unknown as SettingsService,
      [simple],
    );
  });

  it('opens a session with the method used', async () => {
    const session = { id: 's1', entryAt: new Date(), method: 'SIMPLE' };
    create.mockResolvedValue(session);

    await expect(service.checkIn('u1', { method: 'SIMPLE' })).resolves.toBe(
      session,
    );
    expect(verify).toHaveBeenCalledWith({
      userId: 'u1',
      input: { method: 'SIMPLE' },
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'u1', method: 'SIMPLE' } }),
    );
  });

  it('rejects a method disabled in Settings with 403', async () => {
    getSettings.mockResolvedValue({ enabledMethods: ['SCREEN_QR'] });

    await expect(service.checkIn('u1', { method: 'SIMPLE' })).rejects.toThrow(
      ForbiddenException,
    );
    expect(verify).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects an enabled method that has no implementation yet with 403', async () => {
    getSettings.mockResolvedValue({ enabledMethods: ['SIMPLE', 'SCREEN_QR'] });

    await expect(
      service.checkIn('u1', { method: 'SCREEN_QR' }),
    ).rejects.toThrow(ForbiddenException);
    expect(create).not.toHaveBeenCalled();
  });

  it('does not open a session when the method rejects the attempt', async () => {
    verify.mockRejectedValue(new UnauthorizedException('Expired token'));

    await expect(service.checkIn('u1', { method: 'SIMPLE' })).rejects.toThrow(
      'Expired token',
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('returns 409 when the user already has an open session', async () => {
    create.mockRejectedValue(uniqueViolation());

    await expect(service.checkIn('u1', { method: 'SIMPLE' })).rejects.toThrow(
      ConflictException,
    );
  });

  it('rethrows unexpected database errors (500, not a fake 409)', async () => {
    const error = new Error('connection lost');
    create.mockRejectedValue(error);

    await expect(service.checkIn('u1', { method: 'SIMPLE' })).rejects.toBe(
      error,
    );
  });

  describe('checkOut', () => {
    const entryAt = new Date('2026-11-16T18:00:00Z');

    it('closes the open session as closed by the user', async () => {
      findFirst.mockResolvedValue({ id: 's1', entryAt });
      updateMany.mockResolvedValue({ count: 1 });

      const result = await service.checkOut('u1');

      expect(result).toEqual({ id: 's1', entryAt, exitAt: expect.any(Date) });
      expect(findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1', exitAt: null } }),
      );
      expect(updateMany).toHaveBeenCalledWith({
        where: { id: 's1', exitAt: null },
        data: { exitAt: result.exitAt, closedBy: 'USER' },
      });
    });

    it('returns 409 when the user has no open session', async () => {
      findFirst.mockResolvedValue(null);

      await expect(service.checkOut('u1')).rejects.toThrow(ConflictException);
      expect(updateMany).not.toHaveBeenCalled();
    });

    it('returns 409 when the session was closed meanwhile (double tap, auto-close)', async () => {
      findFirst.mockResolvedValue({ id: 's1', entryAt });
      updateMany.mockResolvedValue({ count: 0 });

      await expect(service.checkOut('u1')).rejects.toThrow(ConflictException);
    });
  });
});

describe('check-in methods', () => {
  it('are the same in the shared package and in the database enum', () => {
    // The web app sends CHECKIN_METHODS; the DB stores CheckinMethod
    expect([...CHECKIN_METHODS].sort()).toEqual(
      Object.values(CheckinMethod).sort(),
    );
  });
});
