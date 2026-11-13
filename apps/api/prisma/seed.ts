import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  DEFAULT_SETTINGS,
  buildFakeSessions,
  seededRandom,
} from './seed-data.js';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 12;
const FAKE_SESSION_DAYS = 28;
// Fixed seed: every environment gets the same demo history
const FAKE_SESSION_SEED = 2026;

// Single source of truth per user: the same username is used to find and to create,
// which keeps the seed idempotent (safe to run any number of times).
const SEED_USERS = [
  {
    username: 'joaosilva',
    name: 'João Silva',
    room: '501',
    role: Role.STUDENT,
    passwordEnv: 'SEED_STUDENT_PASSWORD',
  },
  {
    username: 'rececao',
    name: 'Maria Receção',
    room: 'R/C',
    role: Role.RECEPTION,
    passwordEnv: 'SEED_RECEPTION_PASSWORD',
  },
  {
    username: 'admin',
    name: 'Administrador',
    room: 'N/A',
    role: Role.ADMIN,
    passwordEnv: 'SEED_ADMIN_PASSWORD',
  },
] as const;

/** Reads a password from the environment and fails fast if it is missing or too short. */
function readPassword(envName: string): string {
  const value = process.env[envName];
  if (!value || value.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `${envName} is required (at least ${MIN_PASSWORD_LENGTH} chars)`,
    );
  }
  return value;
}

async function main() {
  // Validate every password before touching the database (all or nothing)
  const users = SEED_USERS.map(({ passwordEnv, ...user }) => ({
    ...user,
    password: readPassword(passwordEnv),
  }));

  for (const { password, ...user } of users) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await prisma.user.upsert({
      where: { username: user.username },
      // Re-running the seed resets the password: this is how seed passwords are rotated
      update: { passwordHash },
      create: { ...user, passwordHash },
    });
    // Never log the hash: only the username and role
    console.log(`Seeded ${user.role} user "${user.username}"`);
  }

  await seedSettings();
  await seedFakeSessions('joaosilva');
}

async function seedSettings() {
  await prisma.settings.upsert({
    where: { id: DEFAULT_SETTINGS.id },
    // Empty update: re-running the seed must not undo what an admin changed
    update: {},
    create: DEFAULT_SETTINGS,
  });
  console.log('Seeded settings');
}

/**
 * Demo history for one user. Runs only if the user has no sessions yet, so
 * re-running the seed (e.g. to rotate passwords) never duplicates them and
 * never touches real sessions.
 */
async function seedFakeSessions(username: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { username } });
  const existing = await prisma.session.count({ where: { userId: user.id } });
  if (existing > 0) {
    console.log(`Skipped fake sessions: "${username}" already has sessions`);
    return;
  }

  const settings = await prisma.settings.findUniqueOrThrow({
    where: { id: DEFAULT_SETTINGS.id },
  });
  const sessions = buildFakeSessions({
    userId: user.id,
    now: new Date(),
    days: FAKE_SESSION_DAYS,
    visitProbability: 0.6,
    autoCloseHours: settings.autoCloseHours,
    random: seededRandom(FAKE_SESSION_SEED),
  });
  // One INSERT for all rows instead of one round trip per session
  const { count } = await prisma.session.createMany({ data: sessions });
  console.log(`Seeded ${count} fake sessions for "${username}"`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
