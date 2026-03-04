import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OllamaModelsService } from './ollama-models.service';

describe('OllamaModelsService', () => {
  it('should map models from ollama response and cache by baseUrl', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    let calls = 0;
    (globalThis as { fetch: unknown }).fetch = async () => {
      calls += 1;
      return {
        ok: true,
        json: async () => ({
          models: [
            {
              name: 'gemma3:4b',
              size: 4000,
              details: { family: 'gemma3', quantization_level: 'Q4_K_M' },
            },
          ],
        }),
      } as Response;
    };

    try {
      const service = new OllamaModelsService();
      const first = await service.listModels('http://localhost:11434');
      const second = await service.listModels('http://localhost:11434');

      assert.equal(first.length, 1);
      assert.equal(first[0]?.family, 'gemma3');
      assert.equal(second.length, 1);
      assert.equal(calls, 1);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should return empty list when response is not ok', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: false,
        status: 503,
        json: async () => ({}),
      }) as Response;

    try {
      const service = new OllamaModelsService();
      const models = await service.listModels('http://localhost:11435');
      assert.deepEqual(models, []);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should fallback unknown metadata when model details are missing', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: true,
        json: async () => ({
          models: [{ name: 'tiny-model' }],
        }),
      }) as Response;

    try {
      const service = new OllamaModelsService();
      const models = await service.listModels('http://localhost:11437');
      assert.equal(models[0]?.name, 'tiny-model');
      assert.equal(models[0]?.size, 'unknown');
      assert.equal(models[0]?.quantization, 'unknown');
      assert.equal(models[0]?.family, 'unknown');
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should return empty list when fetch throws', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () => {
      throw new Error('ECONNREFUSED');
    };

    try {
      const service = new OllamaModelsService();
      const models = await service.listModels('http://localhost:11436');
      assert.deepEqual(models, []);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });
});
