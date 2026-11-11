import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 12;

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
