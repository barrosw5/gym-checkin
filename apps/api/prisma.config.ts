
import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// Load .env with Node's built-in loader (no dotenv dependency).
// Only if present: on Render the variables come from the dashboard, not a file.
if (existsSync(".env")) {
  process.loadEnvFile(".env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
