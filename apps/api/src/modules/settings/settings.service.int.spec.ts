import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('should throw when default user is missing (real resolver path)', async () => {
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'gemma3:4b', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    serviceAny.db = {
      select: () => ({
        from: () => ({
          limit: async () => [],
        }),
      }),
    };

    await assert.rejects(
      () => service.getSettings(),
      (error: unknown) => error instanceof NotFoundException,
    );
  });

  it('should throw when settings row is missing (real resolver path)', async () => {
    let selectCount = 0;
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'gemma3:4b', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    serviceAny.db = {
      select: () => {
        selectCount += 1;
        if (selectCount === 1) {
          return {
            from: () => ({
              limit: async () => [{ id: 'u1', name: 'Usuario' }],
            }),
          };
        }
        return {
          from: () => ({
            where: () => ({
              limit: async () => [],
            }),
          }),
        };
      },
    };

    await assert.rejects(
      () => service.getSettings(),
      (error: unknown) => error instanceof NotFoundException,
    );
  });

  it('should map privacy mode to hybrid when privacyMode is false', async () => {
    let selectCount = 0;
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'gemma3:4b', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    serviceAny.db = {
      select: () => {
        selectCount += 1;
        if (selectCount === 1) {
          return {
            from: () => ({
              limit: async () => [{ id: 'u1', name: 'Usuario' }],
            }),
          };
        }
        return {
          from: () => ({
            where: () => ({
              limit: async () => [
                {
                  id: 's1',
                  userId: 'u1',
                  language: 'pt-BR',
                  privacyMode: false,
                  aiProvider: 'ollama',
                  aiModel: 'gemma3:4b',
                  embeddingModel: 'nomic-embed-text',
                  telegramEnabled: false,
                },
              ],
            }),
          }),
        };
      },
    };

    const result = await service.getSettings();
    assert.equal(result.privacyMode, 'hybrid');
  });

  it('should return settings for default user', async () => {
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'gemma3:4b', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    serviceAny.resolveDefaultUser = async () => ({ id: 'u1', name: 'Usuario' });
    serviceAny.resolveSettings = async () => ({
      id: 's1',
      userId: 'u1',
      language: 'pt-BR',
      privacyMode: true,
      aiProvider: 'ollama',
      aiModel: 'gemma3:4b',
      embeddingModel: 'nomic-embed-text',
      telegramEnabled: false,
    });

    const result = await service.getSettings();
    assert.equal(result.userId, 'u1');
    assert.equal(result.aiProvider, 'ollama');
    assert.equal(result.privacyMode, 'local');
  });

  it('should reject azure switch without required environment variables', async () => {
    const oldApiKey = process.env.EXTERNAL_AI_API_KEY;
    const oldBase = process.env.EXTERNAL_AI_BASE_URL;
    delete process.env.EXTERNAL_AI_API_KEY;
    delete process.env.EXTERNAL_AI_BASE_URL;

    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'x', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    serviceAny.resolveDefaultUser = async () => ({ id: 'u1', name: 'Usuario' });
    serviceAny.resolveSettings = async () => ({
      id: 's1',
      userId: 'u1',
      language: 'pt-BR',
      privacyMode: true,
      aiProvider: 'ollama',
      aiModel: 'gemma3:4b',
      embeddingModel: 'nomic-embed-text',
      telegramEnabled: false,
    });

    try {
      await assert.rejects(
        () => service.updateSettings({ aiProvider: 'azure' }),
        (error: unknown) => error instanceof BadRequestException,
      );
    } finally {
      process.env.EXTERNAL_AI_API_KEY = oldApiKey;
      process.env.EXTERNAL_AI_BASE_URL = oldBase;
    }
  });

  it('should update settings and return embedding warning when model changes', async () => {
    const updates: Array<Record<string, unknown>> = [];
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'x', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    let settingsCall = 0;
    serviceAny.resolveDefaultUser = async () => ({ id: 'u1', name: 'Usuario' });
    serviceAny.resolveSettings = async () => {
      settingsCall += 1;
      if (settingsCall === 1) {
        return {
          id: 's1',
          userId: 'u1',
          language: 'pt-BR',
          privacyMode: true,
          aiProvider: 'ollama',
          aiModel: 'gemma3:4b',
          embeddingModel: 'nomic-embed-text',
          telegramEnabled: false,
        };
      }
      return {
        id: 's1',
        userId: 'u1',
        language: 'pt-BR',
        privacyMode: true,
        aiProvider: 'ollama',
        aiModel: 'llama3.2:3b',
        embeddingModel: 'mxbai-embed-large',
        telegramEnabled: false,
      };
    };
    serviceAny.db = {
      update: () => ({
        set: (payload: Record<string, unknown>) => {
          updates.push(payload);
          return { where: async () => undefined };
        },
      }),
      select: () => ({
        from: () => ({
          where: async () => [{ count: 7 }],
        }),
      }),
    };

    const result = await service.updateSettings({
      aiModel: 'llama3.2:3b',
      embeddingModel: 'mxbai-embed-large',
      displayName: 'Novo Nome',
    });

    assert.equal(result.aiModel, 'llama3.2:3b');
    assert.equal(result.embeddingModel, 'mxbai-embed-large');
    assert.equal(result.embeddingCompatibilityWarning?.affected, 7);
    assert.equal(updates.length >= 2, true);
  });

  it('should delegate testAI and listAIModels to collaborators', async () => {
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'gemma3:4b', latencyMs: 12 }),
        }),
      } as never,
      {
        listModels: async () => [
          { name: 'gemma3:4b', size: '4', quantization: 'Q4', family: 'gemma3' },
        ],
      } as never,
    );
    const serviceAny = service as any;
    serviceAny.resolveDefaultUser = async () => ({ id: 'u1', name: 'Usuario' });
    serviceAny.resolveSettings = async () => ({
      id: 's1',
      userId: 'u1',
      language: 'pt-BR',
      privacyMode: true,
      aiProvider: 'ollama',
      aiModel: 'gemma3:4b',
      embeddingModel: 'nomic-embed-text',
      telegramEnabled: false,
    });

    const test = await service.testAI();
    const models = await service.listAIModels();

    assert.equal(test.ok, true);
    assert.equal(test.modelName, 'gemma3:4b');
    assert.equal(models.local.length, 1);
    assert.equal(models.cloud.includes('gpt-5.1'), true);
  });

  it('should surface not found errors from default user lookup', async () => {
    const service = new SettingsService(
      {
        getProvider: () => ({
          testConnection: async () => ({ ok: true, modelName: 'x', latencyMs: 1 }),
        }),
      } as never,
      { listModels: async () => [] } as never,
    );
    const serviceAny = service as any;
    serviceAny.resolveDefaultUser = async () => {
      throw new NotFoundException('Default user not found');
    };

    await assert.rejects(
      () => service.getSettings(),
      (error: unknown) => error instanceof NotFoundException,
    );
  });
});
