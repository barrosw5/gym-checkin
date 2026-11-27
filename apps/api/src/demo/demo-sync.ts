import { randomBytes } from 'node:crypto';
import { type PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { DEMO_ADMIN_USERNAME, DEMO_MEMBERS } from './demo-members.js';
import { type DemoMember, planDemoVisits } from './demo-plan.js';

/** How much history the demo keeps: the longest range of the statistics. */
export const DEMO_HISTORY_DAYS = 90;

type DemoDb = Pick<PrismaClient, 'user' | 'session' | 'settings'>;

export interface DemoSyncOptions {
  now: Date;
  days: number;
  /**
   * Also delete the fictional members' sessions that are not in the plan
   * (older than the period, or from an earlier demo). Only for a full run:
   * with a short period it would delete the history.
   */
  prune: boolean;
}

export interface DemoSyncResult {
  created: number;
  closed: number;
  pruned: number;
}

/** Creates the read-only demo admin if missing. An existing account is left as is. */
async function ensureAdmin(db: DemoDb): Promise<void> {
  const exists = await db.user.findUnique({ where: { username: DEMO_ADMIN_USERNAME }, select: { id: true } });
  if (exists) return;
  // No password login: only the demo button opens it
  const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 10);
  await db.user.createMany({
    data: [{ username: DEMO_ADMIN_USERNAME, name: 'Admin Demo', room: 'N/A', role: Role.ADMIN, isDemo: true, passwordHash }],
    skipDuplicates: true,
  });
}

/** Creates the fictional accounts that are missing; returns the usable ones. */
async function ensureMembers(db: DemoDb): Promise<DemoMember[]> {
  const usernames: string[] = DEMO_MEMBERS.map(([username]) => username);
  const find = () =>
    db.user.findMany({
      where: { username: { in: usernames } },
      select: { id: true, username: true, role: true, isDemo: true, active: true },
    });

  let users = await find();
  const known = new Set(users.map((u) => u.username));
  const missing = DEMO_MEMBERS.filter(([username]) => !known.has(username));

  if (missing.length > 0) {
    const data = [];
    // One hash at a time: leaves the thread pool free for real logins
    for (const [username, name, room] of missing) {
      // A random password nobody knows: nobody can log in with these accounts
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 10);
      data.push({ username, name, room, role: Role.STUDENT, isDemo: true, passwordHash });
    }
    await db.user.createMany({ data, skipDuplicates: true });
    users = await find();
  }

  // Never an account that merely shares a username, or one that was deactivated
  return users
    .filter((u) => u.isDemo && u.active && u.role === Role.STUDENT)
    .map((u) => ({ userId: u.id, username: u.username }));
}

/**
 * Brings the database in line with the demo plan at `now`: visits that are
 * over get closed, visits that started get created (open if still running).
 *
 * Safe to run any number of times, and from several instances: ids are
 * stable, inserts skip what exists and closes only apply "if still open".
 * So a session that a visitor closed or corrected is left as they left it.
 */
export async function syncDemoData(
  db: DemoDb,
  { now, days, prune }: DemoSyncOptions,
): Promise<DemoSyncResult> {
  // Guard on the data itself, not on a flag that can be set by mistake: a real
  // install has imported members (isDemo = false), and then this stops
  const realStudents = await db.user.count({ where: { role: Role.STUDENT, isDemo: false } });
  if (realStudents > 0) {
    throw new Error(`Refusing to add demo data: this database has ${realStudents} real student account(s).`);
  }

  await ensureAdmin(db);
  const members = await ensureMembers(db);
  const userIds = members.map((m) => m.userId);
  const { capacity, autoCloseHours } = await db.settings.findUniqueOrThrow({ where: { id: 'global' } });
  const plan = planDemoVisits({ members, now, days, capacity, autoCloseHours });

  let pruned = 0;
  if (prune) {
    ({ count: pruned } = await db.session.deleteMany({
      where: { userId: { in: userIds }, id: { notIn: plan.map((v) => v.id) } },
    }));
  }

  // Close first: a member with an old visit still open could not start a new one
  const open = await db.session.findMany({
    where: { userId: { in: userIds }, exitAt: null },
    select: { id: true },
  });
  const planned = new Map(plan.map((v) => [v.id, v]));
  let closed = 0;
  for (const { id } of open) {
    const visit = planned.get(id);
    if (!visit || visit.exitAt > now) continue;
    const { count } = await db.session.updateMany({
      where: { id, exitAt: null },
      data: { exitAt: visit.exitAt, closedBy: visit.closedBy },
    });
    closed += count;
  }

  const { count: created } = await db.session.createMany({
    data: plan.map((v) => (v.exitAt <= now ? v : { ...v, exitAt: null, closedBy: null })),
    skipDuplicates: true,
  });

  return { created, closed, pruned };
}
