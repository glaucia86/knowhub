import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { HealthController } from './health.controller';
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

describe('HealthController', () => {
  it('returns degraded with HTTP 200 when database is connected and Ollama is unavailable', async () => {
    const drizzleHealthIndicator = {
      check: async () => ({ status: 'connected', latencyMs: 4 }),
    };
    const ollamaHealthIndicator = {
      check: async () => ({ status: 'unavailable', latencyMs: 10 }),
    };

    let responseStatusCode: number | null = null;
    const response = {
      status: (code: number) => {
        responseStatusCode = code;
      },
    };

    const controller = new HealthController(
      drizzleHealthIndicator as never,
      ollamaHealthIndicator as never,
    );

    const result = await controller.getHealth(response);

    assert.equal(result.status, 'degraded');
    assert.equal(result.database.status, 'connected');
    assert.equal(result.ollama.status, 'unavailable');
    assert.equal(responseStatusCode, null);
  });

  it('returns error with HTTP 503 when database is down', async () => {
    const drizzleHealthIndicator = {
      check: async () => ({ status: 'error', error: 'db down' }),
    };
    const ollamaHealthIndicator = {
      check: async () => ({ status: 'unavailable', latencyMs: 10 }),
    };

    let responseStatusCode: number | null = null;
    const response = {
      status: (code: number) => {
        responseStatusCode = code;
      },
    };

    const controller = new HealthController(
      drizzleHealthIndicator as never,
      ollamaHealthIndicator as never,
    );

    const result = await controller.getHealth(response);

    assert.equal(result.status, 'error');
    assert.equal(result.database.status, 'error');
    assert.equal(responseStatusCode, 503);
  });
});
