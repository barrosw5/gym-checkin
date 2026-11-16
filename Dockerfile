# The whole app in one image: the API serves the web build, like on Render.
# For trying it locally with `docker compose up`; see compose.yaml.
FROM node:24-slim

# Prisma's engines need OpenSSL; the slim image does not ship it
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
# pnpm at the exact version of package.json's packageManager
# (no prompt: the build is not interactive)
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

# Manifests first: this layer (the slow install) is reused until a
# dependency changes, not on every code change
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
# Dev dependencies included on purpose: migrations (Prisma CLI) and the
# seeds (tsx) run at startup. A minimal production image is phase 8 work
RUN pnpm install --frozen-lockfile

COPY . .
# prisma.config.ts requires DATABASE_URL even for `prisma generate`, which
# only reads the schema and never connects. A placeholder for this command
# only (same as the CI API job): the real URL comes from compose.yaml at runtime
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build pnpm build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "docker/entrypoint.sh"]
