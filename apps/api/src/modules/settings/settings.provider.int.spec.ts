import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AIProviderFactory } from './ai-provider.factory';

describe('AIProviderFactory', () => {
  it('should resolve ollama provider and report success', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: true,
        status: 200,
      }) as Response;

    try {
      const factory = new AIProviderFactory();
      const provider = factory.getProvider('ollama');
      const result = await provider.testConnection('gemma3:4b');
      assert.equal(result.ok, true);
      assert.equal(result.modelName, 'gemma3:4b');
      assert.equal(typeof result.latencyMs, 'number');
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should report ollama http error when response is not ok', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: false,
        status: 503,
      }) as Response;

    try {
      const factory = new AIProviderFactory();
      const provider = factory.getProvider('ollama');
      const result = await provider.testConnection('gemma3:4b');
      assert.equal(result.ok, false);
      assert.equal(result.error, 'HTTP 503');
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should resolve azure provider and fail when env is missing', async () => {
    const oldApiKey = process.env.EXTERNAL_AI_API_KEY;
    const oldBase = process.env.EXTERNAL_AI_BASE_URL;
    delete process.env.EXTERNAL_AI_API_KEY;
    delete process.env.EXTERNAL_AI_BASE_URL;

    try {
      const factory = new AIProviderFactory();
      const provider = factory.getProvider('azure');
      const result = await provider.testConnection('gpt-5.1');
      assert.equal(result.ok, false);
      assert.equal(Boolean(result.error), true);
    } finally {
      process.env.EXTERNAL_AI_API_KEY = oldApiKey;
      process.env.EXTERNAL_AI_BASE_URL = oldBase;
    }
  });

  it('should resolve azure provider and handle request failure', async () => {
    const oldApiKey = process.env.EXTERNAL_AI_API_KEY;
    const oldBase = process.env.EXTERNAL_AI_BASE_URL;
    process.env.EXTERNAL_AI_API_KEY = 'test-key';
    process.env.EXTERNAL_AI_BASE_URL = 'https://example.com/health';
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () => {
      throw new Error('network down');
    };

    try {
      const factory = new AIProviderFactory();
      const provider = factory.getProvider('azure');
      const result = await provider.testConnection('gpt-5.1');
      assert.equal(result.ok, false);
      assert.equal(result.error, 'network down');
    } finally {
      process.env.EXTERNAL_AI_API_KEY = oldApiKey;
      process.env.EXTERNAL_AI_BASE_URL = oldBase;
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should resolve azure provider and return http error when upstream is not ok', async () => {
    const oldApiKey = process.env.EXTERNAL_AI_API_KEY;
    const oldBase = process.env.EXTERNAL_AI_BASE_URL;
    process.env.EXTERNAL_AI_API_KEY = 'test-key';
    process.env.EXTERNAL_AI_BASE_URL = 'https://example.com/health';
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: false,
        status: 401,
      }) as Response;

    try {
      const factory = new AIProviderFactory();
      const provider = factory.getProvider('azure');
      const result = await provider.testConnection('gpt-5.1');
      assert.equal(result.ok, false);
      assert.equal(result.error, 'HTTP 401');
    } finally {
      process.env.EXTERNAL_AI_API_KEY = oldApiKey;
      process.env.EXTERNAL_AI_BASE_URL = oldBase;
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });
});
