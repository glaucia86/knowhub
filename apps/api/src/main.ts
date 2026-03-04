import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { readApiEnvironmentConfig } from './config';
import { validateApiEnvironmentOrThrow } from './config/env.validation';
import { bootstrapLocalDatabase } from './db/database.bootstrap';

async function bootstrap(): Promise<void> {
  validateApiEnvironmentOrThrow();
  bootstrapLocalDatabase();
  const app = await NestFactory.create(AppModule);
  const { port } = readApiEnvironmentConfig();
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? 'http://localhost:3000' : true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('KnowHub Local API - EPIC 1.1')
    .setDescription('Documentacao da API local (auth, health, settings).')
    .setVersion('1.1.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  app.enableShutdownHooks();
  await app.listen(port);
}

void bootstrap();
