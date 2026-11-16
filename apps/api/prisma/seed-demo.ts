/**
 * Demo statistics: 15 fake residents and 90 days of visits.
 * Run on purpose only (pnpm db:seed-demo), never as part of a deploy.
 *
 * Safe to re-run: it recreates the visits of these fake residents (so the
 * 90 days end today again) and touches nothing else.
 */
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { RESIDENCE_TIME_ZONE } from '@gym-checkin/shared';
import { offsetAt } from '../src/stats/stats-window.js';
import { DEMO_HABITS, buildDemoVisits, seededRandom } from './seed-data.js';

const prisma = new PrismaClient();

const DAYS = 90;
// Fixed seed: the same demo on every machine
const DEMO_SEED = 90;

const RESIDENTS = [
  ['ana.ferreira', 'Ana Ferreira', '214'],
  ['rui.costa', 'Rui Costa', '102'],
  ['ines.rocha', 'Inês Rocha', '318'],
  ['tiago.matos', 'Tiago Matos', '411'],
  ['joana.reis', 'Joana Reis', '118'],
  ['pedro.alves', 'Pedro Alves', '220'],
  ['marta.lopes', 'Marta Lopes', '305'],
  ['diogo.santos', 'Diogo Santos', '407'],
  ['beatriz.nunes', 'Beatriz Nunes', '126'],
  ['miguel.sousa', 'Miguel Sousa', '233'],
  ['sofia.pinto', 'Sofia Pinto', '312'],
  ['andre.gomes', 'André Gomes', '419'],
  ['carolina.dias', 'Carolina Dias', '109'],
  ['francisco.lima', 'Francisco Lima', '226'],
  ['leonor.cardoso', 'Leonor Cardoso', '330'],
] as const;

/** Today's date in Lisbon (the server may run in UTC). */
function localToday(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: RESIDENCE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

async function main() {
  // Guard on the data itself, not on a flag that can be forgotten: a real
  // install has imported residents (isDemo = false), and then this stops
  const realStudents = await prisma.user.count({ where: { role: Role.STUDENT, isDemo: false } });
  if (realStudents > 0) {
    throw new Error(
      `Refusing to add demo data: this database has ${realStudents} real student account(s).`,
    );
  }

  const residents = [];
  for (const [i, [username, name, room]] of RESIDENTS.entries()) {
    // A random password nobody knows: these accounts exist for the charts,
    // nobody can log in with them
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 10);
    const user = await prisma.user.upsert({
      where: { username },
      update: { isDemo: true, active: true },
      create: { username, name, room, role: Role.STUDENT, isDemo: true, passwordHash },
    });
    residents.push({ userId: user.id, habit: DEMO_HABITS[i % DEMO_HABITS.length] });
  }

  const { autoCloseHours } = await prisma.settings.findUniqueOrThrow({ where: { id: 'global' } });
  const now = new Date();
  const visits = buildDemoVisits({
    residents,
    now,
    days: DAYS,
    autoCloseHours,
    localMidnight: (year, month, day) => {
      const utcMidnight = Date.UTC(year, month - 1, day);
      return utcMidnight - offsetAt(utcMidnight, RESIDENCE_TIME_ZONE);
    },
    today: localToday(now),
    random: seededRandom(DEMO_SEED),
  });

  // Replace only these residents' visits, in one transaction: never half a demo
  const ids = residents.map((r) => r.userId);
  const [, { count }] = await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId: { in: ids } } }),
    prisma.session.createMany({ data: visits }),
  ]);
  console.log(`Seeded ${residents.length} demo residents and ${count} visits over ${DAYS} days`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e instanceof Error ? e.message : e);
    await prisma.$disconnect();
    process.exit(1);
  });
