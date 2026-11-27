// README screenshots of the running app, so they can be retaken whenever
// the interface changes. Start the app with demo data (pnpm dev with
// DEMO_MODE=true, or docker compose up and
// SCREENSHOTS_BASE_URL=http://localhost:3000), then: pnpm screenshots
// Take them during gym hours (07:00-23:00 in Lisbon), or the gym is empty.
// Passwords: the README demo ones, or E2E_*_PASSWORD (same as the e2e test).
import { chromium, devices } from "@playwright/test";

const BASE_URL = process.env.SCREENSHOTS_BASE_URL ?? "http://localhost:5173";
const OUT = "../../docs/screenshots";
const STUDENT = ["joaosilva", process.env.E2E_STUDENT_PASSWORD ?? "estudante-demo"];
const RECEPTION = ["rececao", process.env.E2E_RECEPTION_PASSWORD ?? "rececao-demo"];

const browser = await chromium.launch();

/** Cookies per user: logging in once each stays under the login rate limit. */
const sessions = new Map();

/** A logged-in page. The app follows the device theme, so colorScheme picks it. */
async function openAs([username, password], theme, viewport) {
  const context = await browser.newContext({
    ...viewport,
    locale: "pt-PT",
    colorScheme: theme,
    storageState: sessions.get(username),
  });
  const page = await context.newPage();
  if (sessions.has(username)) {
    await page.goto(BASE_URL);
  } else {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"));
    sessions.set(username, await context.storageState());
  }
  return page;
}

/** Waits for the live occupancy and for the web font, so nothing is half drawn. */
async function settle(page) {
  await page.getByRole("img", { name: /lugares ocupados/ }).waitFor();
  await page.evaluate(() => document.fonts.ready);
}

try {
  // Students use a phone: a phone-sized viewport, at the phone's pixel density
  const phone = { ...devices["iPhone 13"] };
  // Reception and statistics on a PC, sharp on high density screens
  const pc = { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 };
  const leave = (page) => page.getByRole("button", { name: "Sair do ginásio" });
  const ask = (page) => page.getByRole("button", { name: "Pedir entrada à receção" });

  for (const theme of ["light", "dark"]) {
    const student = await openAs(STUDENT, theme, phone);
    // Same starting point every time: outside the gym
    await leave(student).or(ask(student)).waitFor();
    if (await leave(student).isVisible()) await leave(student).click();
    await ask(student).waitFor();
    await settle(student);
    await student.screenshot({ path: `${OUT}/student-phone-${theme}.png` });
    await student.context().close();
  }

  const stats = await openAs(STUDENT, "dark", pc);
  await stats.goto(`${BASE_URL}/stats`);
  await stats.getByRole("button", { name: "30 dias" }).click();
  await stats.getByRole("table").waitFor();
  // The previous period stays dimmed while the new one loads: wait for it
  await stats.locator('[aria-busy="false"]').filter({ has: stats.getByRole("table") }).waitFor();
  await stats.waitForTimeout(500); // the 150 ms fade back to full opacity
  await stats.screenshot({ path: `${OUT}/stats-desktop.png`, fullPage: true });

  // A pending request, so the desk shows its main job (rejected afterwards)
  const waiting = await openAs(STUDENT, "light", phone);
  await ask(waiting).click();

  const desk = await openAs(RECEPTION, "light", pc);
  const requests = desk.getByRole("region", { name: "Pedidos de entrada" });
  const request = requests.getByRole("listitem").filter({ hasText: "João Silva" });
  await request.waitFor();
  await desk.getByRole("region", { name: "Sessões de hoje" }).getByRole("button", { name: "Linha do tempo" }).click();
  await settle(desk);
  // One screen, not the full page: a busy day makes the timeline very long
  await desk.screenshot({ path: `${OUT}/reception-desk.png` });
  await request.getByRole("button", { name: "Rejeitar" }).click();

  await desk.goto(`${BASE_URL}/reception/screen`);
  await desk.locator("figure svg").first().waitFor();
  await settle(desk);
  await desk.screenshot({ path: `${OUT}/qr-screen.png`, fullPage: true });

  console.log(`Screenshots saved in docs/screenshots (from ${BASE_URL})`);
} finally {
  await browser.close();
}
