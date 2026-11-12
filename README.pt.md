# gym-checkin

[English](README.md) · **Português**

Sistema de registo de entradas e saídas no ginásio da residência universitária PIO XII: o estudante regista a entrada e a saída no telemóvel e toda a gente vê quantas pessoas estão no ginásio em tempo real.

**Demo:** <https://gym-checkin-pjyi.onrender.com> (só dados falsos; a primeira resposta pode demorar se o serviço estiver a acordar)

Plano completo e estado das fases: [ROADMAP.md](ROADMAP.md).

## Stack

React + Vite (`apps/web`), NestJS + Prisma (`apps/api`), PostgreSQL na Neon, monorepo com pnpm.

## Correr localmente

Requisitos: Node 24 (ver `.node-version`) e pnpm (versão em `packageManager` no `package.json`).

```bash
pnpm install
pnpm --filter @gym-checkin/shared build   # a API e o web importam o resultado compilado
cp apps/api/.env.example apps/api/.env   # preencher DATABASE_URL, JWT_SECRET e SEED_*
pnpm --filter api db:seed                # cria/atualiza os utilizadores de teste
pnpm --filter api start:dev              # API em http://localhost:3000/api
pnpm --filter web dev                    # site em http://localhost:5173
```

## Ambientes

| Ambiente | Onde corre | Base de dados |
| --- | --- | --- |
| Desenvolvimento | máquina local | Neon, branch `development` |
| Demo | Render (deploy automático a cada merge na `main`) | Neon, branch `production` |
