#!/bin/sh
# Every start: bring the database up to date, then serve the app.
set -e
cd /app/apps/api

# Same migrations as production, applied in order (safe to repeat)
pnpm exec prisma migrate deploy
# The accounts from the README (passwords from compose.yaml)
pnpm db:seed
# 90 days of demo visits ending today (refuses if real students exist)
pnpm db:seed-demo

# exec: the app becomes PID 1 and gets Docker's stop signal (clean shutdown)
exec node dist/main
