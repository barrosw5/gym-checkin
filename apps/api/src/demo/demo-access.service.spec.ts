import { NotFoundException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OccupancyService } from '../gym/occupancy.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { DemoAccessService, STATUS_CACHE_MS } from './demo-access.service.js';

const account = { id: 'u1', username: 'joaosilva', role: 'STUDENT', isDemo: true, active: true };

describe('DemoAccessService', () => {
  const count = vi.fn();
  const findUnique = vi.fn();
  const getOccupancy = vi.fn();
  let demoMode: string | undefined;
  let service: DemoAccessService;

  beforeEach(() => {
    vi.resetAllMocks();
    demoMode = 'true';
    count.mockResolvedValue(0);
    findUnique.mockResolvedValue(account);
    getOccupancy.mockResolvedValue({ count: 6, capacity: 10 });
    service = new DemoAccessService(
      { user: { count, findUnique } } as unknown as PrismaService,
      { get: () => demoMode } as unknown as ConfigService,
      { getOccupancy } as unknown as OccupancyService,
    );
  });

  it('shows only the counts when the demo is open', async () => {
    await expect(service.getStatus()).resolves.toEqual({
      enabled: true,
      occupancy: { count: 6, capacity: 10 },
    });
  });

  it.each([undefined, 'false'])('shares nothing when DEMO_MODE is %o', async (value) => {
    demoMode = value;

    await expect(service.getStatus()).resolves.toEqual({ enabled: false });
    await expect(service.findAccount('STUDENT')).rejects.toThrow(NotFoundException);
    expect(getOccupancy).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('closes when the database has a real member, even with DEMO_MODE on', async () => {
    count.mockResolvedValue(1);

    await expect(service.getStatus()).resolves.toEqual({ enabled: false });
    await expect(service.findAccount('RECEPTION')).rejects.toThrow(NotFoundException);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('reuses the public answer for a few seconds, then asks again', async () => {
    await service.getStatus(0);
    await service.getStatus(STATUS_CACHE_MS - 1);
    expect(getOccupancy).toHaveBeenCalledTimes(1);

    await service.getStatus(STATUS_CACHE_MS);
    expect(getOccupancy).toHaveBeenCalledTimes(2);
  });

  it('opens the demo account of the asked role', async () => {
    await expect(service.findAccount('STUDENT')).resolves.toEqual(account);
    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { username: 'joaosilva' } }),
    );
  });

  it('opens the read-only demo admin, never the real one', async () => {
    findUnique.mockResolvedValue({ ...account, username: 'admin.demo', role: 'ADMIN' });

    await service.findAccount('ADMIN');

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { username: 'admin.demo' } }),
    );
  });

  it.each([
    ['missing', null],
    ['not a demo account', { ...account, isDemo: false }],
    ['deactivated', { ...account, active: false }],
    ['of another role', { ...account, role: 'ADMIN' }],
  ])('refuses an account that is %s', async (_case, user) => {
    findUnique.mockResolvedValue(user);

    await expect(service.findAccount('STUDENT')).rejects.toThrow(NotFoundException);
  });
});
