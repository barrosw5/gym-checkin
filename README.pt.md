# gym-checkin

[English](README.md) · **Português**

Sistema de registo de entradas e saídas no ginásio da residência universitária PIO XII: o estudante regista a entrada e a saída no telemóvel e toda a gente vê quantas pessoas estão no ginásio em tempo real.

**Demo:** <https://gym-checkin-pjyi.onrender.com> (só dados falsos; a primeira resposta pode demorar se o serviço estiver a acordar)

Contas públicas de demonstração (não podem mudar a password; a conta de admin é privada):

| Papel | Username | Password | Experimenta |
| --- | --- | --- | --- |
| Estudante | `joaosilva` | `estudante-demo` | pedir entrada, ler o QR, sair (no telemóvel) |
| Receção | `rececao` | `rececao-demo` | aceitar pedidos, fechar sessões, abrir o ecrã do QR (no PC) |

Plano completo e estado das fases: [ROADMAP.md](ROADMAP.md). Proteção de dados e decisões de segurança: [docs/seguranca-e-privacidade.md](docs/seguranca-e-privacidade.md).

## Destaques

- **Estatísticas ponderadas pelo tempo.** A ocupação é a média por intervalo de 15 minutos, pesada pelo tempo que cada pessoa lá esteve: sair às 18:01 soma 1/15 de pessoa às 18:00, não uma inteira. Dia típico, heatmap dia da semana × hora e duração média/mediana das visitas, para hoje, 7, 30 ou 90 dias.
- **Hora local bem feita.** As estatísticas agrupam pela hora de Lisboa sem biblioteca de datas, e os dias da mudança de hora (23 ou 25 horas) estão cobertos por testes.
- **Hoje vs um dia típico.** A ocupação de hoje é uma linha em degraus exata (um degrau em cada entrada e saída), desenhada por cima do dia típico do período escolhido, mais as horas com menos gente que ainda faltam hoje, pelo histórico desse dia da semana.
- **Privacidade desde o desenho.** Os estudantes só veem agregados: a consulta à base de dados lê as horas de entrada e saída, nunca quem. A receção, que já vê os nomes, tem também o dia de hoje numa linha do tempo, com uma barra por visita.
- **Leve no telemóvel.** A biblioteca de gráficos só é carregada quando alguém abre as estatísticas, por isso as páginas do check-in continuam pequenas.

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
