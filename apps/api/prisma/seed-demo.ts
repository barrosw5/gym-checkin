/**
 * Demo data once: the fictional members and 90 days of their visits up to
 * now. Run on purpose only (pnpm db:seed-demo), never as part of a deploy.
 * To keep the data fresh, run the API with DEMO_MODE=true instead: it does
 * this on startup and then keeps simulating the day (src/demo/).
 *
 * Safe to re-run: it only touches the sessions of the fictional members.
 */
import { PrismaClient } from '@prisma/client';
import { DEMO_HISTORY_DAYS, syncDemoData } from '../src/demo/demo-sync.js';

const prisma = new PrismaClient();

async function main() {
  const { created, closed, pruned } = await syncDemoData(prisma, {
    now: new Date(),
    days: DEMO_HISTORY_DAYS,
    prune: true,
  });
  console.log(`Demo data ready: ${created} visits added, ${closed} closed, ${pruned} old ones removed`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e instanceof Error ? e.message : e);
    await prisma.$disconnect();
    process.exit(1);
  });
