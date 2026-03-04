import { Module } from '@nestjs/common';
import { AIProviderFactory } from './ai-provider.factory';
import { OllamaModelsService } from './ollama-models.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  controllers: [SettingsController],
  providers: [AIProviderFactory, OllamaModelsService, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
