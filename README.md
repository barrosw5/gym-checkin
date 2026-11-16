# gym-checkin

**English** · [Português](README.pt.md)

Gym check-in system for the PIO XII student residence: students check in and out of the gym from their phone, and everyone can see how many people are in the gym right now.

**Demo:** <https://gym-checkin-pjyi.onrender.com> (fake data only; the first response may be slow while the service wakes up)

Public demo accounts (they cannot change their password; the admin account is private):

| Role | Username | Password | Try |
| --- | --- | --- | --- |
| Student | `joaosilva` | `estudante-demo` | ask to enter, scan the QR, leave (on a phone) |
| Reception | `rececao` | `rececao-demo` | accept requests, close sessions, open the QR screen (on a PC) |

Full plan and phase status: [ROADMAP.md](ROADMAP.md) (in Portuguese). Data protection and security decisions: [docs/security-and-privacy.md](docs/security-and-privacy.md).

## Highlights

- **Time-weighted gym statistics.** Occupancy is averaged per 15-minute interval by the time each person was actually inside: leaving at 18:01 adds 1/15 of a person to 18:00, not a whole one. A typical day, a weekday × hour heatmap and the average/median visit length, for today, 7, 30 or 90 days.
- **Local time done right.** Statistics group by Lisbon time without a date library, and the daylight saving days (23 or 25 hours) are covered by tests.
- **Today vs a typical day.** Today's occupancy is an exact step line (a step at every entry and exit), drawn over the typical day of the chosen period, plus the quietest hours still ahead today from that weekday's history.
- **Privacy by design.** Students only see aggregates; the database query reads entry and exit times, never who. Reception, who already sees names, also gets today as a timeline with one bar per visit.
- **Light on the phone.** The charts library is loaded only when someone opens the statistics, so the check-in pages stay small.

## Stack

React + Vite (`apps/web`), NestJS + Prisma (`apps/api`), PostgreSQL on Neon, pnpm monorepo.

## Running locally

Requirements: Node 24 (see `.node-version`) and pnpm (version in `packageManager` in `package.json`).

```bash
pnpm install
pnpm --filter @gym-checkin/shared build   # API and web import its compiled output
cp apps/api/.env.example apps/api/.env   # fill in DATABASE_URL, JWT_SECRET and SEED_*
pnpm --filter api db:seed                # create/update the test users
pnpm --filter api start:dev              # API at http://localhost:3000/api
pnpm --filter web dev                    # site at http://localhost:5173
```

## Environments

| Environment | Runs on | Database |
| --- | --- | --- |
| Development | local machine | Neon, `development` branch |
| Demo | Render (auto-deploy on every merge to `main`) | Neon, `production` branch |
