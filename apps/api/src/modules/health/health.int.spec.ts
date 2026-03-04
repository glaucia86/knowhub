import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OllamaHealthIndicator } from './ollama-health.indicator';

describe('OllamaHealthIndicator', () => {
  it('should return available with models when Ollama responds successfully', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: true,
        json: async () => ({
          models: [{ name: 'gemma3:4b' }, { name: 'llama3.2:3b' }],
        }),
      }) as Response;

    try {
      const indicator = new OllamaHealthIndicator();
      const result = await indicator.check();
      assert.equal(result.status, 'available');
      assert.deepEqual(result.models, ['gemma3:4b', 'llama3.2:3b']);
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should return unavailable when Ollama responds with non-2xx', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () =>
      ({
        ok: false,
        status: 503,
        json: async () => ({}),
      }) as Response;

    try {
      const indicator = new OllamaHealthIndicator();
      const result = await indicator.check();
      assert.equal(result.status, 'unavailable');
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });

  it('should return unavailable when Ollama is offline', async () => {
    const originalFetch = (globalThis as { fetch?: unknown }).fetch;
    (globalThis as { fetch: unknown }).fetch = async () => {
      throw new Error('ECONNREFUSED');
    };

    try {
      const indicator = new OllamaHealthIndicator();
      const result = await indicator.check();
      assert.equal(result.status, 'unavailable');
    } finally {
      (globalThis as { fetch?: unknown }).fetch = originalFetch;
    }
  });
});
