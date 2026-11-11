# gym-checkin

**English** · [Português](README.pt.md)

Gym check-in system for the PIO XII student residence: students check in and out of the gym from their phone, and everyone can see how many people are in the gym right now.

**Demo:** <https://gym-checkin-pjyi.onrender.com> (fake data only; the first response may be slow while the service wakes up)

Full plan and phase status: [ROADMAP.md](ROADMAP.md) (in Portuguese).

## Stack

React + Vite (`apps/web`), NestJS + Prisma (`apps/api`), PostgreSQL on Neon, pnpm monorepo.

## Running locally

Requirements: Node 24 (see `.node-version`) and pnpm (version in `packageManager` in `package.json`).

```bash
pnpm install
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
