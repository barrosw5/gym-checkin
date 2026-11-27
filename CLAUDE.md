# CLAUDE.md

Gym check-in system for **Demo Gym**, a fictional gym for demonstration and learning (see [ROADMAP.md](ROADMAP.md) for the full plan). The UI says member (`sócio`) and member number; the database and code keep the `STUDENT` role and the `room` column on purpose, to avoid a migration.
Monorepo with pnpm: `apps/web` (React + Vite), `apps/api` (NestJS + Prisma + PostgreSQL on Neon), `packages/shared` (`@gym-checkin/shared`: zod schemas, shared types and constants; compiled to `dist/`, so build it before api/web).

Environments: local dev uses the Neon `development` branch; the public demo <https://gym-checkin-pjyi.onrender.com> (Render, auto-deploy on merge to `main`) uses the Neon `production` branch. Seed users are created/rotated with `pnpm db:seed` (passwords from `SEED_*` env vars).

## How to work with me (learning mode)

This project is also a learning project: the goal is to grow as a backend/full-stack developer and write code at a senior level.

- **Small steps.** Every roadmap phase is split into small steps. Deliver one small step at a time, with the code for that step only (little code per step).
- **Always include a short explanation** with each step: what the code does and **why** it is done this way (trade-offs, rejected alternatives when relevant).
- **Link to concepts** from the study order in ROADMAP.md section 15 when relevant (HTTP status codes, transactions, indexes, auth, etc.).
- **Ask before big changes.** For anything that touches several files or changes the architecture, propose a short plan first.
- **Act as a senior reviewer.** Point out issues a senior engineer would flag (security, naming, missing tests, edge cases), even outside the scope of the request.
- Update the checkboxes in ROADMAP.md when a roadmap item is done.
- **Who runs what.** Claude runs the automated checks itself (lint, tests, build, `prisma generate`, building `packages/shared`, migrations/seed on the `development` database) and reports the results. Claude also creates the branch, commits (Conventional Commits) and pushes, once the checks pass and the user's manual test is OK. The user does the manual tests (locally or on the deployed demo), opens the PR on GitHub and merges it: Claude hands over the manual test commands with the expected output, and the PR title (the `feat`/`fix` one, since the squash merge uses it) and description.

## General Conventions

- **All code comments must be written in English.**
- **Conventional Commits** for every commit: `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `test(scope): ...`, `docs: ...`, `chore: ...` (e.g. roadmap updates are `docs: update roadmap`).
- **The stack is decided.** Do not reopen decisions already taken (NestJS, React + Vite SPA, Prisma, Neon, SSE, Vitest). **Ask before adding any new dependency.**
- Before considering a task done, run:
  - `apps/api`: `pnpm lint`, `pnpm test` and `pnpm build` (Vitest does not type-check; only the build catches type errors, same as CI)
  - `apps/web`: `pnpm lint`, `pnpm test`, `pnpm build` and `pnpm build-storybook`

## Business Rules and Security

- **Critical rules live in the backend and the database, never only in the frontend.** The frontend only improves UX. Example: "one open session per user" is enforced by the partial unique index `one_open_session_per_user`.
- **The check-in method is a swappable component** (Strategy pattern): `SCREEN_QR` (rotating QR) and `RECEPTION_APPROVAL` (reception approves a request). `SIMPLE` (no proof of presence) was removed in Phase 4; `SessionMethod.SIMPLE` only remains for old sessions. Adding a new method must not require changing the others. The backend must support several methods enabled at the same time (configured in `Settings`).
- **Authentication:** JWT in an `httpOnly` cookie. **Never** store tokens in `localStorage`. Authorization via role-based guards (`STUDENT` / `RECEPTION` / `ADMIN`).
- **Roles are separate:** only `STUDENT` checks in/out and asks for entry; `RECEPTION` approves requests, closes/corrects sessions and opens the QR screen; `ADMIN` does what reception does plus account management. Staff never check in (`@Roles(STUDENT)` on the check-in endpoints), and each role has its own home page.
- **Public demo shortcuts** (`/api/demo`: occupancy count and one-click member/reception/demo-admin login) exist only with `DEMO_MODE=true` and no real member account. The demo admin (`admin.demo`) is read-only for accounts (`NoDemoGuard`) and sees demo accounts only; any new account-changing endpoint needs that guard. Everything else needs a session.
- **Checkout does not require a token.** Sessions closed by the periodic job are marked `closedBy: AUTO` so they don't distort statistics.
- Rate limit the login and check-in endpoints.

## Privacy (GDPR)

- Store the minimum personal data (name, room, username, sessions).
- Public statistics return **only aggregates** (counts), never who was in the gym.
- Each user can only see their own history; only reception/admin can see individual sessions.

## Backend Architecture (`apps/api`)

- NestJS organized in **domain modules** (`auth/`, `checkin/`, `gym/`, `stats/`, `admin/`...).
- Layering: **Controller (HTTP) → Service (business rules) → Prisma (data access)**.
- **Every API route is under `/api`** (global prefix in `src/app.setup.ts`). All other paths belong to the SPA, so a page and an API route never share a path.
  - Controllers contain no business logic: they parse the request, call the service, and return the response.
  - Services know nothing about HTTP (no `req`/`res`); they throw domain/Nest exceptions.
- Validation with `zod`, with schemas and types shared between front and back in `packages/shared`.
- Every new business rule ships with **Vitest tests**, including edge cases (duplicate open session, checkout without session, expired token, future token, token reuse).

## Frontend Architecture (`apps/web`)

To keep the code clean and scalable, the frontend (React) must strictly follow this layered architecture. Data flows top-down:

**Page (View) → Components (UI + Hook) → Hooks (State/Logic) → Services (Business Rules) → API (HTTP Calls)**

### Folder structure (`apps/web/src/`)

- `pages/`: the views (e.g. `pages/auth/page.tsx`, `pages/dashboard/page.tsx`). They are "empty shells" that only import Components to build the page (similar to the Next.js App Router pattern).
- `components/`: UI components (e.g. `LoginForm`, `Dashboard`). **They must call their own Hooks internally** to manage state and logic, keeping the Page clean.
- `hooks/`: custom React hooks (e.g. `useAuth.ts`, `useDashboard.ts`). They manage state (`useState`, `useEffect`), call the services, and return data to the component. Hooks without JSX use the `.ts` extension.
- `core/services/`: business logic. Processes data before sending it to the API or after receiving it.
- `core/api/`: pure HTTP calls using `fetch` or `axios` (e.g. `authApi.ts`). No React state.
- `core/types/`: shared TypeScript interfaces and types.
- `core/utils/`: pure presentation helpers (e.g. `formatTime`), no state and no API. The only `core/` folder components may import directly; services are reached only through the component's hook.

### Styling, views and Storybook

- **Tailwind** for all styling; no inline `style={{}}` except truly dynamic values (e.g. a bar width).
- **Light and dark theme:** colours are roles (`surface`, `ink`, `accent`, `data`...) in `src/index.css`, with one value per theme. Components use only these roles, never palette classes (`slate-500`) or `dark:` variants. Text pairs must pass WCAG AA in both themes, data colours 3:1. The only exception is the white field behind a QR code (scanners need it).
- **Design direction (Demo Gym):** sporty and exact. Neutral graphite surfaces; lime is the one accent (primary action, selection, the data that matters); orange means full or warning. Signature: the member number as a race bib, `MemberBib` (member numbers only). Moments with colour: the occupancy as one block per place, and the QR screen as a lime plaque. No emoji (lucide icons, `ICON` size/stroke), weights 400 to 600, sentence case, no exclamation marks or greeting titles, `tabular-nums` for numbers, transitions named (never `transition-all`).
- **Layout:** logged-in pages render inside `AppShell` (sidebar from `lg`, bottom navigation on phones) and use `ui/Page` for title and width; `ui/PageLayout` is only for pages outside the shell (login, forced password change). Navigation entries live in `core/utils/navigation.ts` and follow the same roles as the routes (`RoleGate`).
- **Mobile first:** design for the phone, then widen with `sm:`/`md:`. Touch targets at least 44 px (`min-h-11`).
- `components/ui/`: reusable building blocks (`Button`, `Card`, `Alert`, `TextField`, `PageLayout`) that only take props.
- **View split:** a feature component (e.g. `CheckinButton`) only calls its hook and renders `XView` (e.g. `CheckinPanelView`) with props. Views hold no data hooks (only `useTranslation()` and local form state), so they render the same in the app and in Storybook.
- **Every view and UI component ships with a `.stories.tsx` next to it**, one story per state (loading, empty, error, success...). Stories can be switched PT/EN in the toolbar and are checked by the a11y addon.

### Text and languages (i18n)

- **No fixed user-visible text in components, hooks or services.** Every sentence lives in `core/i18n/locales/pt.ts` (source of truth) and `en.ts` (typed as `Messages`: missing, extra or misspelled keys fail the build). Components call `t("some.key", params)` from `useTranslation()`.
- Services throw `TranslatableError(key, params)` instead of `Error("sentence")`; hooks keep it as a `Translatable` (`toTranslatable(err)`); components show it with `tm(message)`.
- Dates and times are formatted in the active language (`formatTime(date, languageTag)`).

### File naming

- Hooks: `useX.ts` (e.g. `useDashboard.ts`). Only hooks start with `use` (React reserves the prefix; the react-hooks lint rules apply to it).
- Services: same name as the hook that uses them, without `use`: `xService.ts` (e.g. `useCheckin` → `checkinService.ts`). A hook may reuse another hook's service (e.g. `useCurrentUser` uses `authService`).
- API: `xApi.ts` (e.g. `checkinApi.ts`). Components: `PascalCase.tsx`.
