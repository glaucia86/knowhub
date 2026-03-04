import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DrizzleHealthIndicator } from './drizzle-health.indicator';
import { HealthController } from './health.controller';
import { OllamaHealthIndicator } from './ollama-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DrizzleHealthIndicator, OllamaHealthIndicator],
  exports: [DrizzleHealthIndicator, OllamaHealthIndicator],
})
export class HealthModule {}
