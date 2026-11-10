import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API running at: http://localhost:${port}`);
}
bootstrap().catch((error) => {
  // Fail loudly: a rejected promise here would otherwise be an unhandled rejection
  console.error('Failed to start the API', error);
  process.exit(1);
});
