// Screenshots of every screen with the same busy moment every time, whatever
// the real hour: the app runs as usual, and the API answers are built from the
// demo plan and the API's own statistics code. No database, no passwords.
//
//   pnpm --filter @gym-checkin/shared build && pnpm --filter api build
//   pnpm --filter web dev                      (in another terminal)
//   pnpm --filter web screenshots              README images (docs/screenshots)
//   pnpm --filter web screenshots --all <dir>  every screen, both themes
import "../../api/node_modules/reflect-metadata/Reflect.js";
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const BASE_URL = process.env.SCREENSHOTS_BASE_URL ?? "http://localhost:5173";
// A Tuesday at 19:45 in Lisbon: the evening peak
const NOW = new Date("2026-11-24T19:45:00Z");
const CAPACITY = 10;

const api = (file) => import(new URL(`../../api/dist/${file}`, import.meta.url));
const { planDemoVisits } = await api("demo/demo-plan.js");
const { DEMO_MEMBERS } = await api("demo/demo-members.js");
const { StatsService } = await api("stats/stats.service.js");

// ---------- the data of that moment ----------
const members = DEMO_MEMBERS.map(([username, name, room]) => ({ userId: username, username, name, room }));
const visits = planDemoVisits({ members, now: NOW, days: 90, capacity: CAPACITY, autoCloseHours: 2 });
const isOpen = (v) => v.exitAt > NOW;
const occupancy = { count: visits.filter(isOpen).length, capacity: CAPACITY };

// The real statistics service, reading the planned visits instead of a table
const stats = new StatsService({
  session: {
    findMany: async ({ where }) => {
      const from = where.AND[0].OR[1].exitAt.gt;
      return visits
        .filter((v) => isOpen(v) || (v.closedBy !== "AUTO" && v.exitAt > from))
        .map((v) => ({ entryAt: v.entryAt, exitAt: isOpen(v) ? null : v.exitAt }));
    },
  },
});

const startOfDay = new Date(`${NOW.toISOString().slice(0, 10)}T00:00:00Z`);
const byUsername = new Map(members.map((m) => [m.userId, m]));
const todaySessions = visits
  .filter((v) => v.entryAt >= startOfDay)
  .sort((a, b) => b.entryAt - a.entryAt)
  .map((v) => ({
    id: v.id,
    entryAt: v.entryAt,
    exitAt: isOpen(v) ? null : v.exitAt,
    method: v.method,
    closedBy: isOpen(v) ? null : v.closedBy,
    user: byUsername.get(v.userId),
  }));
// Someone outside the gym, asking to enter
const waiting = members.find((m) => !visits.some((v) => v.userId === m.userId && isOpen(v)));

const user = (id, name, room, username, role, isDemo = true) => ({
  id, name, room, username, role, isDemo, active: true, createdAt: NOW, mustChangePassword: false,
});
const USERS = {
  student: user("s", "João Silva", "501", "joaosilva", "STUDENT"),
  reception: user("r", "Maria Receção", "R/C", "rececao", "RECEPTION"),
  admin: user("a", "Administrador", "N/A", "admin", "ADMIN", false),
};
const accounts = [
  ...members
    .map((m) => user(m.userId, m.name, m.room, m.username, "STUDENT"))
    .sort((a, b) => a.name.localeCompare(b.name)),
  USERS.reception,
  USERS.admin,
];

// ---------- every screen ----------
// 16:9 on a PC (fills a slide or a video frame), a modern phone
const PC = { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1.5 };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

const tab = (name) => async (page) => {
  await page.getByRole("button", { name }).click();
};
const month = tab("30 dias");
const heatmap = async (page) => {
  await month(page);
  await page.getByRole("table").evaluate((table) => table.closest("section").scrollIntoView({ block: "end" }));
};

// Scrolled to the end: the evening, where the people inside now are
const timeline = async (page) => {
  await tab("Linha do tempo")(page);
  await page.getByRole("group", { name: "Visitas de hoje" }).evaluate((list) => list.scrollTo(0, list.scrollHeight));
};

/** name: [who is logged in, path, device, optional step before the shot] */
const SCREENS = {
  "login-desktop": [null, "/login", PC],
  "member-desktop": ["student", "/dashboard", PC],
  "stats-desktop": ["student", "/stats", PC, month],
  "heatmap-desktop": ["student", "/stats", PC, heatmap],
  "reception-desktop": ["reception", "/reception", PC],
  "timeline-desktop": ["reception", "/reception", PC, timeline],
  "accounts-desktop": ["admin", "/admin", PC],
  "qr-screen": ["reception", "/reception/screen", PC],
  "login-phone": [null, "/login", PHONE],
  "member-phone": ["student", "/dashboard", PHONE],
  "stats-phone": ["student", "/stats", PHONE, month],
  "heatmap-phone": ["student", "/stats", PHONE, heatmap],
  "account-phone": ["student", "/account", PHONE],
  "reception-phone": ["reception", "/reception", PHONE],
};

/** The README gallery: [screen, theme] */
const README = [
  ["login-desktop", "light"], ["member-desktop", "dark"], ["stats-desktop", "light"],
  ["reception-desktop", "dark"], ["accounts-desktop", "light"], ["qr-screen", "dark"],
  ["member-phone", "light"], ["member-phone", "dark"], ["heatmap-phone", "dark"],
];

const all = process.argv.indexOf("--all");
const outDir = resolve(all > 0 ? process.argv[all + 1] : "../../docs/screenshots");
const wanted =
  all > 0
    ? ["light", "dark"].flatMap((theme) => Object.keys(SCREENS).map((name) => [name, theme]))
    : README;

const browser = await chromium.launch();
try {
  await mkdir(outDir, { recursive: true });
  for (const [name, theme] of wanted) {
    const [who, path, device, step] = SCREENS[name];
    const context = await browser.newContext({
      ...device, colorScheme: theme, locale: "pt-PT", timezoneId: "Europe/Lisbon",
    });
    // The live streams: one message, then silence
    await context.addInitScript(({ count, request }) => {
      window.EventSource = class {
        constructor(url) {
          const data = url.includes("requests") ? request : count;
          setTimeout(() => this.onmessage?.({ data: JSON.stringify(data) }), 50);
        }
        close() {}
      };
    }, {
      count: occupancy,
      request: [{ id: "q", createdAt: new Date(NOW - 40_000).toISOString(), user: waiting }],
    });
    const page = await context.newPage();
    // The page believes it is that moment too (countdown, "calmest hour left")
    await page.clock.setFixedTime(NOW);
    await page.route((url) => url.pathname.startsWith("/api/"), async (route) => {
      const url = new URL(route.request().url());
      const json = (body, status = 200) =>
        route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
      switch (url.pathname) {
        case "/api/auth/me": return who ? json(USERS[who]) : json({ message: "Unauthorized" }, 401);
        case "/api/demo": return json({ enabled: true, occupancy });
        case "/api/checkin/current": return json({ session: null });
        case "/api/checkin/methods": return json({ enabledMethods: ["SCREEN_QR", "RECEPTION_APPROVAL"] });
        case "/api/checkin/requests/current": return json({ request: null });
        case "/api/stats/summary": return json(await stats.summary(url.searchParams.get("range"), NOW));
        case "/api/admin/sessions": return json(todaySessions);
        case "/api/admin/users": return json(accounts);
        case "/api/admin/qr/current":
          return json({ token: "Zq3xP0kR7yVw2mN8bL4tHA", refreshAt: new Date(+NOW + 22_000), windowSeconds: 30, secondsLeft: 22 });
        default: return json({ message: `Not simulated: ${url.pathname}` }, 404);
      }
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto(BASE_URL + path);
    await page.getByRole("heading", { level: 1 }).waitFor();
    if (step) await step(page);
    await page.waitForLoadState("networkidle");
    await page.locator('[aria-busy="true"]').waitFor({ state: "detached" });
    await page.evaluate(() => document.fonts.ready);
    // No pointer left over a chart (its tooltip would be in the picture)
    await page.mouse.move(0, 0);
    // Transitions (150-1000 ms) finished
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${outDir}/${name}-${theme}.png` });
    console.log(`${name}-${theme}${errors.length ? ` ERRORS ${errors.join("; ")}` : ""}`);
    await context.close();
  }
  console.log(`Screenshots saved in ${outDir}`);
} finally {
  await browser.close();
}
