// README screenshots of the running app, so they can be retaken whenever
// the interface changes. Start the app (pnpm dev, or docker compose up and
// SCREENSHOTS_BASE_URL=http://localhost:3000), then: pnpm screenshots
// Passwords: the README demo ones, or E2E_*_PASSWORD (same as the e2e test).
import { chromium, devices } from "@playwright/test";

const BASE_URL = process.env.SCREENSHOTS_BASE_URL ?? "http://localhost:5173";
const OUT = "../../docs/screenshots";
const STUDENT = ["joaosilva", process.env.E2E_STUDENT_PASSWORD ?? "estudante-demo"];
const RECEPTION = ["rececao", process.env.E2E_RECEPTION_PASSWORD ?? "rececao-demo"];

async function logIn(page, [username, password]) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

const browser = await chromium.launch();
try {
  // Students use a phone: a phone-sized viewport, at the phone's pixel density
  const phone = await browser.newContext({ ...devices["iPhone 13"], locale: "pt-PT" });
  const student = await phone.newPage();
  await logIn(student, STUDENT);
  await student.getByRole("img", { name: /lugares ocupados/ }).waitFor();
  // Wait for the check-in card to settle (not "checking if you are inside...")
  await student.getByRole("button", { name: /Pedir entrada|Sair do ginásio/ }).waitFor();
  await student.screenshot({ path: `${OUT}/student-phone.png` });

  await student.goto(`${BASE_URL}/stats`);
  await student.getByRole("button", { name: "30 dias" }).click();
  await student.getByRole("table").waitFor();
  await student.screenshot({ path: `${OUT}/stats-phone.png`, fullPage: true });

  // Reception works on a PC
  const pc = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: "pt-PT" });
  const desk = await pc.newPage();
  await logIn(desk, RECEPTION);
  await desk.getByRole("region", { name: "Sessões de hoje" }).getByRole("button", { name: "Linha do tempo" }).click();
  await desk.screenshot({ path: `${OUT}/reception-desk.png`, fullPage: true });

  await desk.goto(`${BASE_URL}/reception/screen`);
  await desk.locator("figure svg").first().waitFor();
  await desk.screenshot({ path: `${OUT}/qr-screen.png` });

  console.log(`Screenshots saved in docs/screenshots (from ${BASE_URL})`);
} finally {
  await browser.close();
}
