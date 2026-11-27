# gym-checkin

[![CI](https://github.com/barrosw5/gym-checkin/actions/workflows/ci.yml/badge.svg)](https://github.com/barrosw5/gym-checkin/actions/workflows/ci.yml)
[![CodeQL](https://github.com/barrosw5/gym-checkin/actions/workflows/codeql.yml/badge.svg)](https://github.com/barrosw5/gym-checkin/actions/workflows/codeql.yml)
![Node](https://img.shields.io/badge/Node-24-3c873a)
![React](https://img.shields.io/badge/Web-React%20%2B%20Vite%20%2B%20TypeScript-0b0b0b)
![NestJS](https://img.shields.io/badge/API-NestJS%20%2B%20Prisma-5a8000)
![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-336791)
[![License](https://img.shields.io/badge/License-MIT-52514e)](LICENSE)

[English](README.md) · **Português**

Uma app de check-in para o **Ginásio Demo**, um ginásio fictício criado para este projeto de aprendizagem e portefólio: sabe quão cheio está o ginásio antes de ires, e entra e sai pelo telemóvel.

**Demo:** <https://gym-checkin-pjyi.onrender.com> (sócios fictícios entram e saem ao longo do dia, por isso está sempre em uso; o primeiro carregamento pode demorar uns segundos)

| Role | Username | Password |
| --- | --- | --- |
| Sócio | `joaosilva` | `estudante-demo` |
| Receção | `rececao` | `rececao-demo` |
| Admin (demo, só de leitura) | botão no login | |

Não é preciso escrever nada: o login tem um botão para cada uma das três.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/screenshots/tour-dark.webp">
  <img src="docs/screenshots/tour-light.webp" alt="Uma volta pela app: login, início do sócio, estatísticas, receção, contas e ecrã do QR" width="100%">
</picture>

## Ecrãs

| Login, com a ocupação ao vivo | Início do sócio |
| --- | --- |
| <img src="docs/screenshots/login-desktop-light.png" alt="Login: frase e ocupação ao vivo ao lado do formulário e dos botões de demo" width="420"> | <img src="docs/screenshots/member-desktop-dark.png" alt="Início do sócio: pessoas lá dentro, pedir entrada, a curva de hoje e a melhor altura para ir" width="420"> |

| Balcão da receção | Ecrã do QR virado para os sócios |
| --- | --- |
| <img src="docs/screenshots/reception-desktop-dark.png" alt="Receção: ocupação, um pedido de entrada pendente e quem está lá dentro" width="420"> | <img src="docs/screenshots/qr-screen-dark.png" alt="Código QR rotativo em ecrã inteiro, com passos, ocupação ao vivo e contagem" width="420"> |

| Estatísticas | Contas (admin) |
| --- | --- |
| <img src="docs/screenshots/stats-desktop-light.png" alt="Estatísticas de 30 dias: números principais e hoje sobre o dia típico" width="420"> | <img src="docs/screenshots/accounts-desktop-light.png" alt="Tabela de contas com pesquisa e botão de importar" width="420"> |

| Telemóvel, claro | Telemóvel, escuro | Horas com mais gente |
| --- | --- | --- |
| <img src="docs/screenshots/member-phone-light.png" alt="Início do sócio no telemóvel, tema claro" width="260"> | <img src="docs/screenshots/member-phone-dark.png" alt="Início do sócio no telemóvel, tema escuro" width="260"> | <img src="docs/screenshots/heatmap-phone-dark.png" alt="Heatmap por dia da semana e hora no telemóvel" width="260"> |

## Porquê

No Ginásio Demo, que é fictício, é preciso ir buscar a chave à receção e preencher uma folha em papel. O ginásio é pequeno e não há forma de saber quantas pessoas lá estão antes de chegar. A folha em papel também não serve para estatísticas.

## O que faz

- **Vês quantas pessoas estão no ginásio agora**, em tempo real, no telemóvel.
- **Entras** lendo o QR do ecrã da receção, ou pedindo à receção que te aceite. Uma foto do QR não funciona a partir de casa: o código muda a cada 30 segundos.
- **Sais** com um toque. Quem se esquece de sair é fechado automaticamente.
- **Vês quando está mais calmo**: um dia típico, as horas com mais gente em cada dia da semana e a melhor altura para ir hoje.
- **A receção** aceita pedidos, vê quem está lá dentro e as visitas de hoje numa linha do tempo, e corrige horas erradas, tudo num só ecrã.
- **O admin** importa sócios de um ficheiro CSV e gere as contas.
- **Funciona como uma app** no telemóvel (instalável), em português e inglês, com tema claro e escuro.

## Para quem programa

- **Regras na base de dados:** "uma visita aberta por pessoa" é um índice único, seguro mesmo com dois pedidos ao mesmo tempo.
- **Estatísticas justas:** cada visita conta pelo tempo que a pessoa esteve mesmo lá dentro, na hora de Lisboa, incluindo os dias da mudança de hora.
- **Privacidade desde o desenho:** os sócios só veem contagens, nunca quem lá esteve ([segurança e privacidade](docs/seguranca-e-privacidade.md)).
- **Uma demo sempre viva:** sócios fictícios entram e saem ao longo do dia, com horários calculados só a partir da data, por isso um reinício nunca duplica dados e as contas reais nunca são tocadas.
- **Testado de ponta a ponta:** cada pull request arranca a app inteira em Docker e um browser faz o fluxo principal.
- **Acessível:** áreas de toque grandes, contraste WCAG AA, navegação por teclado, uma story no Storybook para cada parte do ecrã.

```mermaid
flowchart LR
  phone["Telemóvel do sócio"] --> app
  desk["PC da receção"] --> app
  screen["Ecrã do QR"] -. lido pelo .-> phone
  app["API NestJS + app React"] --> db[("PostgreSQL")]
```

React + Vite + Tailwind, NestJS + Prisma, PostgreSQL, schemas zod partilhados pelos dois, monorepo com pnpm.

## Experimentar no teu computador

Com o [Docker](https://docs.docker.com/get-docker/):

```bash
docker compose up
```

Abre <http://localhost:3000> e entra com as contas acima (admin local: `admin` / `admin-local-only`). Vem com 90 dias de visitas falsas e sócios fictícios a entrar e a sair, por isso a app parece viva e as estatísticas aparecem cheias.

## Desenvolvimento

Requisitos: Node 24 e pnpm.

```bash
pnpm install
pnpm --filter @gym-checkin/shared build
cp apps/api/.env.example apps/api/.env   # preencher DATABASE_URL, JWT_SECRET, QR_SECRET, SEED_*
pnpm --filter api exec prisma migrate deploy
pnpm --filter api db:seed                # as contas acima
pnpm --filter api db:seed-demo           # opcional: 90 dias de visitas falsas (DEMO_MODE=true no .env continua a gerá-las)
pnpm --filter api start:dev              # API: http://localhost:3000/api
pnpm --filter web dev                    # app: http://localhost:5173
```

Verificações: `pnpm lint`, `pnpm test` e `pnpm build` em cada pacote, `pnpm storybook` e `pnpm e2e` em `apps/web`. O CI corre-as em cada pull request.

As imagens acima saem de `pnpm --filter web screenshots` (com a API compilada e o servidor de desenvolvimento do site a correr): mostra sempre o mesmo fim de tarde cheio, por isso podem ser refeitas a qualquer hora.

## Documentação

- [Documentação da API](https://gym-checkin-pjyi.onrender.com/api/docs) (interativa)
- [Segurança e privacidade](docs/seguranca-e-privacidade.md)
- [Roadmap](ROADMAP.md)
