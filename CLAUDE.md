# CLAUDE.md

Gym check-in system for a student residence (see [ROADMAP.md](ROADMAP.md) for the full plan).
Monorepo with pnpm: `apps/web` (React + Vite), `apps/api` (NestJS + Prisma + PostgreSQL on Neon), `packages/shared` (planned: zod schemas and shared types).

Environments: local dev uses the Neon `development` branch; the public demo <https://gym-checkin-pjyi.onrender.com> (Render, auto-deploy on merge to `main`) uses the Neon `production` branch. Seed users are created/rotated with `pnpm db:seed` (passwords from `SEED_*` env vars).

## How to work with me (learning mode)

This project is also a learning project: the goal is to grow as a backend/full-stack developer and write code at a senior level.

- **Small steps.** Every roadmap phase is split into small steps. Deliver one small step at a time, with the code for that step only (little code per step).
- **Always include a short explanation** with each step: what the code does and **why** it is done this way (trade-offs, rejected alternatives when relevant).
- **Link to concepts** from the study order in ROADMAP.md section 15 when relevant (HTTP status codes, transactions, indexes, auth, etc.).
- **Ask before big changes.** For anything that touches several files or changes the architecture, propose a short plan first.
- **Act as a senior reviewer.** Point out issues a senior engineer would flag (security, naming, missing tests, edge cases), even outside the scope of the request.
- Update the checkboxes in ROADMAP.md when a roadmap item is done.

## General Conventions

- **All code comments must be written in English.**
- **Conventional Commits** for every commit: `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, `test(scope): ...`, `docs: ...`, `chore: ...` (e.g. roadmap updates are `docs: update roadmap`).
- **The stack is decided.** Do not reopen decisions already taken (NestJS, React + Vite SPA, Prisma, Neon, SSE, Vitest). **Ask before adding any new dependency.**
- Before considering a task done, run:
  - `apps/api`: `pnpm lint` and `pnpm test`
  - `apps/web`: `pnpm lint` and `pnpm build`

## Business Rules and Security

- **Critical rules live in the backend and the database, never only in the frontend.** The frontend only improves UX. Example: "one open session per user" is enforced by the partial unique index `one_open_session_per_user`.
- **The check-in method is a swappable component** (Strategy pattern): `SIMPLE`, `SCREEN_QR`, `RECEPTION_APPROVAL`. Adding a new method must not require changing the others. The backend must support several methods enabled at the same time (configured in `Settings`).
- **Authentication:** JWT in an `httpOnly` cookie. **Never** store tokens in `localStorage`. Authorization via role-based guards (`STUDENT` / `RECEPTION` / `ADMIN`).
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
- Validation with `zod`, with schemas and types shared between front and back in `packages/shared` (planned).
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
