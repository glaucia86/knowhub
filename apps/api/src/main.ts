import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = Number.parseInt(process.env.PORT ?? '', 10) || 3001;
  await app.listen(port);
}

void bootstrap();
