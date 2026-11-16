import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import { setupDocs } from './docs.setup.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  // On by default (the demo shows them); API_DOCS=false on an install with real data
  if (process.env.API_DOCS !== 'false') setupDocs(app);
  // Run onModuleDestroy hooks (e.g. close DB connections) on SIGTERM from Render
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running at: http://localhost:${port}`);
}
bootstrap().catch((error) => {
  // Fail loudly: a rejected promise here would otherwise be an unhandled rejection
  console.error('Failed to start the API', error);
  process.exit(1);
});
