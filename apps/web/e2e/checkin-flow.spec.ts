import { expect, test, type Page } from "@playwright/test";

// The README demo accounts (docker compose seeds them with these passwords).
// Locally, set E2E_*_PASSWORD to the SEED_* values of apps/api/.env
const STUDENT = { username: "joaosilva", password: process.env.E2E_STUDENT_PASSWORD ?? "estudante-demo" };
const RECEPTION = { username: "rececao", password: process.env.E2E_RECEPTION_PASSWORD ?? "rececao-demo" };

async function logIn(page: Page, { username, password }: { username: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

/** People inside now, read the way a screen reader does: "3 de 10 lugares ocupados". */
async function occupancy(page: Page): Promise<number> {
  const label = await page.getByRole("img", { name: /lugares ocupados/ }).getAttribute("aria-label");
  return Number(label?.match(/^(\d+)/)?.[1]);
}

/**
 * The main flow, as two people on two devices: a student asks to enter,
 * reception accepts, the student is inside and the live count goes up, then
 * the student leaves and it goes back down. Separate browser contexts =
 * separate cookies, like two phones.
 */
test("a student asks to enter, reception accepts, the student leaves", async ({ browser }) => {
  const student = await (await browser.newContext()).newPage();
  const reception = await (await browser.newContext()).newPage();

  await logIn(student, STUDENT);
  await expect(student).toHaveURL(/\/dashboard$/);

  // Start from "outside": a previous run (or a demo visitor) may have left him inside
  const leave = student.getByRole("button", { name: "Sair do ginásio" });
  const ask = student.getByRole("button", { name: "Pedir entrada à receção" });
  await expect(leave.or(ask)).toBeVisible();
  if (await leave.isVisible()) await leave.click();
  await expect(ask).toBeVisible();
  const before = await occupancy(student);

  await ask.click();
  await expect(student.getByText("À espera que a receção aceite o pedido")).toBeVisible();

  await logIn(reception, RECEPTION);
  await expect(reception).toHaveURL(/\/reception$/);
  const requests = reception.getByRole("region", { name: "Pedidos de entrada" });
  await requests.getByRole("listitem").filter({ hasText: "João Silva" }).getByRole("button", { name: "Aceitar" }).click();

  // The student's page finds out by itself (no reload): polling and the live stream
  await expect(student.getByText(/No ginásio desde as/)).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => occupancy(student)).toBe(before + 1);

  await student.getByRole("button", { name: "Sair do ginásio" }).click();
  await expect(student.getByText("Não estás no ginásio")).toBeVisible();
  await expect.poll(() => occupancy(student)).toBe(before);
});
