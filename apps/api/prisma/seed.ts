import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash the password 'password123' using bcrypt with 10 salt rounds
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create a Student user
  const student = await prisma.user.upsert({
    where: { username: 'aluno1' },
    update: {},
    create: {
      username: 'joaosilva',
      name: 'João Silva',
      room: '501',
      passwordHash,
      role: Role.STUDENT,
    },
  });

  // 2. Create a Reception user
  const reception = await prisma.user.upsert({
    where: { username: 'rececao' },
    update: {},
    create: {
      username: 'rececao',
      name: 'Maria Receção',
      room: 'R/C',
      passwordHash,
      role: Role.RECEPTION,
    },
  });

  // 3. Create an Admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Administrador',
      room: 'N/A',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log({ student, reception, admin });
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
