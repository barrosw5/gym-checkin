# Plano do projeto: registo de entradas no ginásio (PIO XII)

Plano de trabalho · versão 2 · 5 de novembro de 2026

---

## 1. Resumo

O objetivo é substituir a folha de papel do ginásio da residência por um sistema web simples: o estudante regista a entrada e a saída com o telemóvel, a receção valida o momento da entrada, e toda a gente consegue ver **quantas pessoas estão no ginásio agora** e, mais tarde, estatísticas de utilização (horas de pico, melhores horas para treinar, etc.).

O projeto serve três propósitos ao mesmo tempo: resolve um problema real, é uma ótima oportunidade para aprender backend, bases de dados e tempo real, e pode ficar como um projeto de portfólio no GitHub (com a possibilidade de um piloto na residência).

Restrição principal: **sem hardware novo** (sem sensores nem NFC). Usa-se apenas telemóveis e o ecrã/computador que a receção já tem.

## 2. O problema que estamos a resolver

- Hoje, para treinar, é preciso ir à receção buscar a chave, preencher uma folha (nome, quarto, assinatura, dia, hora e minuto de entrada e saída) e devolver a chave no fim.
- Não há forma de saber antes de descer quantas pessoas estão no ginásio, que é pequeno. Isto pode estragar um treino.
- O registo em papel não serve para estatísticas.

## 3. O que o sistema precisa de garantir

1. **O registo acontece no momento**, com a pessoa fisicamente presente (e não a partir do quarto).
2. **Uma pessoa só pode estar dentro uma vez**: não se pode spammar "Entrar".
3. **A ocupação atual é visível** para todos os residentes, em tempo real.
4. **A saída fecha a sessão** e, se alguém se esquecer, o sistema corrige-se sozinho.
5. **Os dados pessoais são tratados com cuidado** (RGPD).

## 4. Decisão sobre segurança (importante)

Um QR impresso em papel é fixo, por isso não prova presença: qualquer pessoa pode tirar-lhe uma foto e usá-lo do quarto. Não vamos ignorar este problema nem tentar resolvê-lo com truques frágeis (geolocalização, IP). Vamos **isolá-lo num componente trocável**, o "método de check-in", e implementar vários métodos por ordem de força:

| Método | Como funciona | Força |
| --- | --- | --- |
| **A. QR dinâmico num ecrã** | Uma página em ecrã inteiro (no computador da receção ou num telemóvel/tablet antigo) mostra um QR que muda a cada 30 s. O estudante faz scan e confirma. | Forte (a foto expira em 30 s) |
| **B. Aprovação da receção** | O estudante cria um pedido pendente (por exemplo com um QR fixo em papel) e a receção aprova no painel de admin. O pedido expira em 2 minutos. | Média/forte (validação humana) |
| **C. Modo simples** | Só login e botão. Serve para desenvolvimento e demonstração. | Fraca (só confiança) |

**Ordem de implementação: C (para testar), depois A, depois B.** O backend deve aceitar vários métodos em simultâneo, e a residência escolhe qual ativar nas definições. Esta separação limpa é também um ponto forte para mostrar a quem ler o repositório.

## 5. Fluxos principais

### 5.1 Entrada (método A)

1. A receção abre `/reception/screen` no computador. A página pede o token atual à API a cada poucos segundos e desenha o QR.
2. O estudante faz scan com a câmara. O link abre `/c/<token>` no browser.
3. Se não tiver sessão iniciada, faz login (a sessão é de longa duração, por isso nas vezes seguintes não pede nada).
4. A página mostra o botão "Entrar no ginásio" (ou "Sair", se já tiver uma sessão aberta).
5. Ao confirmar, a API valida o token (ainda é o da janela atual ou da anterior), verifica que o utilizador não tem sessão aberta e cria a sessão.

**Token do ecrã:** `HMAC(segredo, floor(agora / 30s))`. Não precisa de ser guardado em base de dados: o servidor recalcula-o e aceita a janela atual e a imediatamente anterior (margem para o relógio e para o tempo que o scan demora).

### 5.2 Entrada (método B: aprovação)

1. O estudante abre o site (por exemplo por um QR fixo na receção) e carrega em "Pedir entrada".
2. Cria-se um `CheckinRequest` pendente com validade de 2 minutos. Só pode haver um pendente por pessoa.
3. O painel de admin mostra o pedido (nome, quarto) e a pessoa da receção aprova ou rejeita.
4. Ao aprovar, cria-se a sessão. O painel de admin atualiza-se em tempo real.

### 5.3 Saída

Decisão: **a saída não precisa de token**. A saída não precisa de prova de presença (ninguém ganha nada em "sair" sem ter saído), e assim há menos fricção e menos esquecimentos. Basta o utilizador autenticado carregar em "Sair". Além disso:

- A receção pode fechar a sessão ao receber a chave.
- **Auto-close:** sessões abertas há mais de X horas (por exemplo 2 h, configurável) fecham-se sozinhas e ficam marcadas como `AUTO`, para não estragarem as estatísticas.
- O admin pode corrigir sessões manualmente.

### 5.4 Regras de negócio

- Um utilizador só pode ter **uma sessão aberta** (garantido na base de dados, ver secção 8).
- Não se pode registar saída sem sessão aberta.
- Limite de pedidos por minuto (rate limit) nos endpoints de check-in e de login.
- Capacidade máxima configurável. O contador mostra "7/10" e passa a vermelho quando está cheio (informativo, sem bloquear).

## 6. Arquitetura

Três peças, num único repositório:

1. **App dos estudantes (React):** login, ecrã de scan/entrada/saída, contador ao vivo, estatísticas públicas e histórico pessoal.
2. **Painel de receção/admin (React, mesma app com rotas protegidas por papel):** ecrã do QR dinâmico, lista de pedidos pendentes, ocupação atual, correção de sessões, gestão de utilizadores.
3. **API + base de dados (NestJS + Prisma + PostgreSQL):** autenticação, regras de negócio, estatísticas, tempo real.

Fluxo geral: `Telemóvel / PC da receção → API REST → PostgreSQL`, com a API a enviar atualizações em tempo real (Server-Sent Events) para o contador e para o painel.

## 7. Stack

- **Linguagem:** TypeScript em tudo, para partilhar tipos e validações.
- **Frontend:** React com Vite; React Router; TanStack Query; Recharts; `qrcode.react`.
- **Backend:** NestJS.
- **Base de dados:** PostgreSQL (alojado na Neon).
- **ORM:** Prisma.
- **Validação:** `zod`, num pacote partilhado entre front e back.
- **Autenticação:** sessões por cookie `httpOnly` com JWT.
- **Tempo real:** Server-Sent Events.
- **Testes:** Vitest (unitários e de API); Playwright para um teste ponta a ponta.
- **Infra local:** Base de dados Neon (Cloud) para desenvolvimento e produção.
- **CI:** GitHub Actions (lint, testes, build).
- **Hospedagem:** Render (Web Service para a API) + Neon (PostgreSQL).

## 8. Modelo de dados

**User**

- `id`, `name`, `room`, `username` (unique), `passwordHash`
- `role`: `STUDENT` | `RECEPTION` | `ADMIN`
- `active`, `createdAt`

**Session** (uma ida ao ginásio)

- `id`, `userId`, `entryAt`, `exitAt` (nulo enquanto está dentro)
- `method`: `SCREEN_QR` | `RECEPTION_APPROVAL` | `SIMPLE` | `MANUAL`
- `closedBy`: `USER` | `RECEPTION` | `AUTO` | `ADMIN`

**CheckinRequest** (método B)

- `id`, `userId`, `createdAt`, `expiresAt`
- `status`: `PENDING` | `APPROVED` | `REJECTED` | `EXPIRED`
- `decidedById`, `decidedAt`

**Settings**

- `capacity`, `autoCloseHours`, `enabledMethods`, `qrWindowSeconds`

**Regra crítica na base de dados** (migração SQL):

```sql
CREATE UNIQUE INDEX one_open_session_per_user
  ON "Session" ("userId")
  WHERE "exitAt" IS NULL;
```

## 9. API (primeira versão)

### Autenticação e utilizador

- `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`

### Estudantes

- `GET /gym/occupancy` devolve `{ count, capacity }`
- `GET /gym/stream` (SSE) envia atualizações da ocupação
- `POST /checkin` com `{ token }` (método A)
- `POST /checkin/requests` cria o pedido pendente (método B)
- `POST /checkout`
- `GET /me/sessions` mostra o histórico pessoal

### Receção/admin

- `GET /admin/qr/current` devolve o token atual
- `GET /admin/requests` e `POST /admin/requests/:id/approve|reject`
- `GET /admin/sessions` e `PATCH /admin/sessions/:id`
- `POST /admin/users/import` e `PATCH /admin/users/:id`
- `GET/PATCH /admin/settings`

### Estatísticas (agregadas, sem dados pessoais)

- `GET /stats/heatmap`
- `GET /stats/hourly` e `GET /stats/duration`

## 10. Estrutura do repositório

```text
gym-checkin/
  apps/
    web/        # React + Vite
    api/        # NestJS + Prisma
  packages/
    shared/     # tipos e schemas zod
  README.md
  docs/         # diagrama de arquitetura, decisões, RGPD
```

## 11. Frontend Architecture Guidelines

Para manter um código limpo e escalável, o frontend (React) deve seguir estritamente esta arquitetura em camadas. O fluxo de dados é top-down:

**Page (View) → Components (UI) → Hooks (State/Logic) → Services (Business Rules) → API (HTTP Calls)**

### Estrutura de pastas (`apps/web/src/`)

- `pages/`: as views (ex: Login, Dashboard). Apenas juntam componentes e chamam hooks.
- `components/`: componentes de UI "burros" (ex: `LoginForm`, `Button`, `Navbar`). Recebem dados via props e não fazem chamadas HTTP.
- `hooks/`: custom React hooks (ex: `useAuth.ts`). Gerem o estado (`useState`, `useEffect`) e chamam os serviços.
- `core/services/`: lógica de negócio. Processam dados antes de enviar para a API ou depois de receber.
- `core/api/`: chamadas HTTP puras usando `fetch` ou `axios` (ex: `authApi.ts`). Sem estado React.
- `core/types/`: interfaces e tipos TypeScript partilhados.

## 12. Roadmap por fases

### Fase 0: Preparação

- [x] Criar o repositório e o monorepo com pnpm
- [x] API "hello world" em NestJS e app React a chamá-la
- [x] Deploy inicial na Render e ligação à base de dados Neon

### Fase 1: Base (utilizadores e sessões)

- [x] Schema Prisma e migrações (incluindo o índice parcial)
- [x] Seed com utilizadores e sessões falsas
- [x] Login/logout com cookie e rotas protegidas por papel (Backend e Frontend de login)
- [x] `GET /auth/me` e o ecrã de login (backend e frontend)
- [ ] Refatoração do frontend para a arquitetura em camadas (API → Services → Hooks → Components → Pages)

### Fase 2: Check-in simples (método C) e ocupação

- [ ] `POST /checkin`, `POST /checkout` e regras de sessão única
- [ ] Contador de ocupação em tempo real (SSE)
- [ ] Auto-close das sessões esquecidas (tarefa periódica)
- [ ] Testes das regras de negócio

> No fim desta fase já tens um sistema utilizável, só falta a verificação de presença.

### Fase 3: QR dinâmico (método A)

- [ ] Geração e validação do token por janelas de tempo
- [ ] Página `/reception/screen` com o QR a renovar
- [ ] Página `/c/<token>` com o botão Entrar/Sair
- [ ] Rate limiting e testes (token expirado, token futuro, reutilização)

### Fase 4: Painel de receção (método B)

- [ ] Pedidos pendentes com expiração
- [ ] Lista em tempo real e aprovar/rejeitar
- [ ] Correção manual de sessões e gestão de utilizadores (import CSV)

### Fase 5: Estatísticas

- [ ] Cálculo de ocupação por intervalos (por exemplo de 15 em 15 minutos)
- [ ] Heatmap por dia da semana e hora, horas de pico, duração média
- [ ] Ecrã "melhor altura para ir"
- [ ] Extras: "vou às 18h", previsão simples com base no histórico

### Fase 6: Polimento e GitHub

- [ ] PWA (instalável) e boa experiência no telemóvel
- [ ] README com problema, diagrama, screenshots/GIF e instruções com `docker compose up`
- [ ] Documentação da API (OpenAPI/Swagger)
- [ ] Secção de RGPD e decisões de segurança em `docs/`
- [ ] Teste ponta a ponta do fluxo principal (Playwright)

### Fase 7: Piloto na residência (opcional)

- [ ] Apresentar uma demonstração à direção/receção
- [ ] Testar com um grupo pequeno de residentes
- [ ] Recolher feedback e ajustar

## 13. RGPD e privacidade

- Guardar o mínimo de dados: nome, quarto, username e as sessões.
- As estatísticas públicas mostram só agregados (contagens), nunca quem estava lá.
- Cada utilizador vê apenas o seu próprio histórico; só a receção/admin vê sessões individuais.
- Definir uma política de retenção (por exemplo apagar ou anonimizar sessões com mais de 12 meses).
- Permitir a um utilizador pedir a eliminação da conta.
- Documentar isto no repositório.

## 14. Riscos e decisões em aberto

- **Adoção:** se a folha em papel continuar a existir em paralelo, o contador fica incompleto.
- **Ecrã da receção:** confirmar que existe um computador ou ecrã que possa mostrar a página do QR.
- **Falta de ligação:** se o Wi-Fi falhar, deve haver um plano B (a folha em papel como contingência).
- **Decisão por tomar:** tempo do auto-close e capacidade do ginásio.
- **Decisão tomada:** Backend em NestJS (em vez de Fastify).
- **Decisão tomada:** Sessão por cookie `httpOnly` com JWT.
- **Decisão tomada:** Frontend com React + Vite (SPA).
- **Decisão tomada:** Hospedagem do backend na Render, com serviço de keep-alive (UptimeRobot) para evitar hibernação.

## 15. Ordem de estudo para aprender o backend

1. Fundamentos de HTTP e REST (métodos, códigos de estado, cookies) e o NestJS básico.
2. SQL e PostgreSQL (joins, índices, transações), antes ou ao lado do Prisma.
3. Autenticação: sessões, hash de passwords, papéis e autorização.
4. Validação com `zod` e tratamento de erros.
5. Testes de API com Vitest.
6. Server-Sent Events e tarefas periódicas (auto-close).
7. CI e deploy.
