# gym-checkin

[English](README.md) · **Português**

Uma app de check-in para o **Ginásio Demo**, um ginásio fictício criado para este projeto de aprendizagem e portefólio: sabe quão cheio está o ginásio antes de ires, e entra e sai pelo telemóvel.

**Demo:** <https://gym-checkin-pjyi.onrender.com> (dados falsos; o primeiro carregamento pode demorar uns segundos)

| Role | Username | Password |
| --- | --- | --- |
| Sócio | `joaosilva` | `estudante-demo` |
| Receção | `rececao` | `rececao-demo` |

| Sócio (telemóvel) | Estatísticas (telemóvel) |
| --- | --- |
| <img src="docs/screenshots/student-phone.png" alt="Início do sócio: pessoas no ginásio agora, pedir entrada" width="300"> | <img src="docs/screenshots/stats-phone.png" alt="Estatísticas: hoje sobre o dia típico, duração das visitas, heatmap dia da semana por hora" width="300"> |

| Balcão da receção (PC) | Ecrã do QR na receção |
| --- | --- |
| <img src="docs/screenshots/reception-desk.png" alt="Receção: ocupação, pedidos de entrada, visitas de hoje numa linha do tempo" width="420"> | <img src="docs/screenshots/qr-screen.png" alt="Código QR rotativo em ecrã inteiro" width="420"> |

## Porquê

No Ginásio Demo, que é fictício, é preciso ir buscar a chave à receção e preencher uma folha em papel. O ginásio é pequeno e não há forma de saber quantas pessoas lá estão antes de chegar. A folha em papel também não serve para estatísticas.

## O que faz

- **Vês quantas pessoas estão no ginásio agora**, em tempo real, no telemóvel.
- **Entras** lendo o QR do ecrã da receção, ou pedindo à receção que te aceite. Uma foto do QR não funciona a partir de casa: o código muda a cada 30 segundos.
- **Sais** com um toque. Quem se esquece de sair é fechado automaticamente.
- **Vês quando está mais calmo**: um dia típico, as horas com mais gente em cada dia da semana e a melhor altura para ir hoje.
- **A receção** aceita pedidos, vê quem está lá dentro e as visitas de hoje numa linha do tempo, e corrige horas erradas.
- **Funciona como uma app** no telemóvel (instalável), em português e inglês.

## Para quem programa

- **Regras na base de dados:** "uma visita aberta por pessoa" é um índice único, seguro mesmo com dois pedidos ao mesmo tempo.
- **Estatísticas justas:** cada visita conta pelo tempo que a pessoa esteve mesmo lá dentro, na hora de Lisboa, incluindo os dias da mudança de hora.
- **Privacidade desde o desenho:** os sócios só veem contagens, nunca quem lá esteve ([segurança e privacidade](docs/seguranca-e-privacidade.md)).
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

Abre <http://localhost:3000> e entra com as contas acima (admin local: `admin` / `admin-local-only`). Vem com 90 dias de visitas falsas, por isso as estatísticas aparecem cheias.

## Desenvolvimento

Requisitos: Node 24 e pnpm.

```bash
pnpm install
pnpm --filter @gym-checkin/shared build
cp apps/api/.env.example apps/api/.env   # preencher DATABASE_URL, JWT_SECRET, QR_SECRET, SEED_*
pnpm --filter api exec prisma migrate deploy
pnpm --filter api db:seed                # as contas acima
pnpm --filter api db:seed-demo           # opcional: 90 dias de visitas falsas
pnpm --filter api start:dev              # API: http://localhost:3000/api
pnpm --filter web dev                    # app: http://localhost:5173
```

Verificações: `pnpm lint`, `pnpm test` e `pnpm build` em cada pacote, `pnpm storybook` e `pnpm e2e` em `apps/web`. O CI corre-as em cada pull request.

## Documentação

- [Documentação da API](https://gym-checkin-pjyi.onrender.com/api/docs) (interativa)
- [Segurança e privacidade](docs/seguranca-e-privacidade.md)
- [Roadmap](ROADMAP.md)
