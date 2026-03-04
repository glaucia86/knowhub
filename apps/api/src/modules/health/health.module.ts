import { Module } from '@nestjs/common';
import { DrizzleHealthIndicator } from './drizzle-health.indicator';
import { HealthController } from './health.controller';
import { OllamaHealthIndicator } from './ollama-health.indicator';

@Module({
  controllers: [HealthController],
  providers: [DrizzleHealthIndicator, OllamaHealthIndicator],
  exports: [DrizzleHealthIndicator, OllamaHealthIndicator],
})
export class HealthModule {}
