import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readApiEnvironmentConfig } from './config';
import { validateApiEnvironmentOrThrow } from './config/env.validation';
import { bootstrapLocalDatabase } from './db/database.bootstrap';

async function bootstrap(): Promise<void> {
  validateApiEnvironmentOrThrow();
  bootstrapLocalDatabase();
  const app = await NestFactory.create(AppModule);
  const { port } = readApiEnvironmentConfig();
  app.enableShutdownHooks();
  await app.listen(port);
}

void bootstrap();
