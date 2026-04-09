import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { AIModelInfo } from '@knowhub/shared-types';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

class SettingsAIServiceStub {
  async getSettings() {
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

  async updateSettings() {
    throw new Error('not used');
  }

  async testAI() {
    return {
      ok: true,
      modelName: 'gemma3:4b',
      latencyMs: 42,
    };
  }

  async listAIModels() {
    const localModels: AIModelInfo[] = [
      { name: 'gemma3:4b', size: '4.0 GB', quantization: 'Q4_K_M', family: 'gemma3' },
      { name: 'llama3.2:3b', size: '3.2 GB', quantization: 'Q4_K_M', family: 'llama3.2' },
    ];
    return {
      local: localModels,
      cloud: ['gpt-5.1', 'gpt-4.1-mini'],
    };
  }
}

@Module({
  controllers: [SettingsController],
  providers: [{ provide: SettingsService, useClass: SettingsAIServiceStub }],
})
class SettingsAITestModule {}

describe('POST /api/v1/settings/test-ai and GET /api/v1/settings/ai-models', () => {
  it('should test provider connectivity', async () => {
    const app = await NestFactory.create(SettingsAITestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(0, '127.0.0.1');

    try {
      const address = app.getHttpServer().address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/settings/test-ai`, {
        method: 'POST',
      });
      const payload = (await response.json()) as {
        ok: boolean;
        modelName: string;
        latencyMs: number;
      };

      assert.equal(response.status, 201);
      assert.equal(payload.ok, true);
      assert.equal(payload.modelName, 'gemma3:4b');
      assert.equal(typeof payload.latencyMs, 'number');
    } finally {
      await app.close();
    }
  });

  it('should list local and cloud models', async () => {
    const app = await NestFactory.create(SettingsAITestModule, { logger: false });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.listen(0, '127.0.0.1');

    try {
      const address = app.getHttpServer().address() as { port: number };
      const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/settings/ai-models`);
      const payload = (await response.json()) as { local: AIModelInfo[]; cloud: string[] };

      assert.equal(response.status, 200);
      assert.equal(payload.local.length, 2);
      assert.equal(payload.local[0]?.family, 'gemma3');
      assert.deepEqual(payload.cloud, ['gpt-5.1', 'gpt-4.1-mini']);
    } finally {
      await app.close();
    }
  });
});
