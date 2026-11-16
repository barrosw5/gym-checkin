import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests: a real browser against the whole app (web + API + DB).
 * Locally: against `pnpm dev` (http://localhost:5173). In CI: against the
 * `docker compose up` app, with E2E_BASE_URL=http://localhost:3000.
 */
export default defineConfig({
  testDir: "e2e",
  // One flow that changes shared state (the occupancy): never in parallel
  workers: 1,
  fullyParallel: false,
  // A flaky end-to-end test is a bug to fix, not to hide with retries
  retries: 0,
  // In CI, a forgotten test.only must fail the run instead of skipping the rest
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    // On failure, keep a step-by-step trace (DOM, network) to see what happened
    trace: "retain-on-failure",
    locale: "pt-PT",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
