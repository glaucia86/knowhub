import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SettingsController } from './settings.controller';
import type { SettingsResponse } from '@knowhub/shared-types';
import type { UpdateSettingsDto } from './dto/settings.dto';
import { SettingsService } from './settings.service';

class SettingsServiceStub {
  async getSettings(): Promise<SettingsResponse> {
    return {
      id: 'settings-1',
      userId: 'user-1',
      displayName: 'Usuario',
      preferredLanguage: 'pt-BR',
      privacyMode: 'local',
      aiProvider: 'ollama',
      aiModel: 'gemma3:4b',
      embeddingModel: 'nomic-embed-text',
      telegramEnabled: false,
    };
  }

  async updateSettings(payload: UpdateSettingsDto): Promise<SettingsResponse> {
    return {
      id: 'settings-1',
      userId: 'user-1',
      displayName: 'Usuario',
      preferredLanguage: 'pt-BR',
      privacyMode: 'local',
      aiProvider: 'ollama',
      aiModel: payload.aiModel ?? 'gemma3:4b',
      embeddingModel: payload.embeddingModel ?? 'nomic-embed-text',
      telegramEnabled: false,
      ...(payload.embeddingModel && payload.embeddingModel !== 'nomic-embed-text'
        ? {
            embeddingCompatibilityWarning: {
              affected: 12,
              currentModel: 'nomic-embed-text',
              newModel: payload.embeddingModel,
            },
          }
        : {}),
    };
  }

  async testAI() {
    return { ok: true, modelName: 'gemma3:4b', latencyMs: 10 };
  }

  async listAIModels() {
    return { local: [], cloud: [] };
  }
}

@Module({
  controllers: [SettingsController],
  providers: [{ provide: SettingsService, useClass: SettingsServiceStub }],
})
class SettingsTestModule {}

describe('GET/PATCH /api/v1/settings', () => {
  it('should read current settings', async () => {
    const app = await NestFactory.create(SettingsTestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(0, '127.0.0.1');

    try {
      const address = app.getHttpServer().address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/settings`);
      const payload = (await response.json()) as SettingsResponse;

      assert.equal(response.status, 200);
      assert.equal(payload.aiProvider, 'ollama');
      assert.equal(payload.aiModel, 'gemma3:4b');
    } finally {
      await app.close();
    }
  });

  it('should patch settings and return embedding compatibility warning when model changes', async () => {
    const app = await NestFactory.create(SettingsTestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(0, '127.0.0.1');

    try {
      const address = app.getHttpServer().address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/settings`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          aiModel: 'llama3.2:3b',
          embeddingModel: 'mxbai-embed-large',
        } satisfies UpdateSettingsDto),
      });
      const payload = (await response.json()) as SettingsResponse;

      assert.equal(response.status, 200);
      assert.equal(payload.aiModel, 'llama3.2:3b');
      assert.equal(payload.embeddingModel, 'mxbai-embed-large');
      assert.equal(payload.embeddingCompatibilityWarning?.affected, 12);
      assert.equal(payload.embeddingCompatibilityWarning?.currentModel, 'nomic-embed-text');
      assert.equal(payload.embeddingCompatibilityWarning?.newModel, 'mxbai-embed-large');
    } finally {
      await app.close();
    }
  });
});
