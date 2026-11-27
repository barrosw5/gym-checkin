import type { PrismaClient } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_MEMBERS } from './demo-members.js';
import { type DemoVisit, planDemoVisits } from './demo-plan.js';
import { syncDemoData } from './demo-sync.js';

vi.mock('bcrypt', () => ({ default: { hash: vi.fn(async () => 'hash') } }));

// A Thursday evening: some visits over, some running
const NOW = new Date('2026-11-26T19:15:00Z');

const users = DEMO_MEMBERS.map(([username], i) => ({
  id: `u${i}`,
  username: username as string,
  role: 'STUDENT',
  isDemo: true,
  active: true,
}));
const plan = planDemoVisits({
  members: users.map((u) => ({ userId: u.id, username: u.username })),
  now: NOW,
  days: 2,
  capacity: 10,
  autoCloseHours: 2,
});
const over = plan.find((v) => v.exitAt <= NOW) as DemoVisit;
const running = plan.find((v) => v.exitAt > NOW) as DemoVisit;

describe('syncDemoData', () => {
  const db = {
    user: { count: vi.fn(), findMany: vi.fn(), createMany: vi.fn() },
    session: { findMany: vi.fn(), updateMany: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
    settings: { findUniqueOrThrow: vi.fn() },
  };
  const sync = (prune = false) =>
    syncDemoData(db as unknown as PrismaClient, { now: NOW, days: 2, prune });

  beforeEach(() => {
    vi.clearAllMocks();
    db.user.count.mockResolvedValue(0);
    db.user.findMany.mockResolvedValue(users);
    db.settings.findUniqueOrThrow.mockResolvedValue({ capacity: 10, autoCloseHours: 2 });
    db.session.findMany.mockResolvedValue([]);
    db.session.updateMany.mockResolvedValue({ count: 1 });
    db.session.createMany.mockResolvedValue({ count: 0 });
    db.session.deleteMany.mockResolvedValue({ count: 0 });
  });

  it('refuses to touch a database with real members', async () => {
    db.user.count.mockResolvedValue(3);

    await expect(sync(true)).rejects.toThrow(/3 real student/);
    expect(db.user.createMany).not.toHaveBeenCalled();
    expect(db.session.deleteMany).not.toHaveBeenCalled();
    expect(db.session.createMany).not.toHaveBeenCalled();
  });

  it('creates only the fictional accounts that are missing', async () => {
    db.user.findMany.mockResolvedValueOnce(users.slice(2)).mockResolvedValueOnce(users);

    await sync();

    const [{ data, skipDuplicates }] = db.user.createMany.mock.calls[0];
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ username: users[0].username, isDemo: true, role: 'STUDENT' });
    expect(skipDuplicates).toBe(true);
  });

  it('ignores accounts that are not fictional members, or are deactivated', async () => {
    db.user.findMany.mockResolvedValue([
      { ...users[0], role: 'RECEPTION' },
      { ...users[1], isDemo: false },
      { ...users[2], active: false },
    ]);

    await sync(true);

    expect(db.session.deleteMany.mock.calls[0][0].where.userId).toEqual({ in: [] });
    expect(db.session.createMany.mock.calls[0][0].data).toEqual([]);
  });

  it('creates running visits as open and finished ones as closed', async () => {
    await sync();

    const [{ data, skipDuplicates }] = db.session.createMany.mock.calls[0];
    expect(data).toContainEqual({ ...running, exitAt: null, closedBy: null });
    expect(data).toContainEqual(over);
    expect(skipDuplicates).toBe(true);
  });

  it('closes an open visit once its time is up, only if still open', async () => {
    db.session.findMany.mockResolvedValue([{ id: over.id }, { id: running.id }, { id: 'someone-else' }]);

    await expect(sync()).resolves.toMatchObject({ closed: 1 });
    expect(db.session.updateMany).toHaveBeenCalledTimes(1);
    expect(db.session.updateMany).toHaveBeenCalledWith({
      where: { id: over.id, exitAt: null },
      data: { exitAt: over.exitAt, closedBy: over.closedBy },
    });
  });

  it('deletes nothing on a short run', async () => {
    await sync(false);

    expect(db.session.deleteMany).not.toHaveBeenCalled();
  });

  it('prunes only the fictional members\' sessions outside the plan', async () => {
    db.session.deleteMany.mockResolvedValue({ count: 4 });

    await expect(sync(true)).resolves.toMatchObject({ pruned: 4 });
    expect(db.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: { in: users.map((u) => u.id) }, id: { notIn: plan.map((v) => v.id) } },
    });
  });
});
