import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DrizzleHealthIndicator } from './drizzle-health.indicator';

describe('DrizzleHealthIndicator', () => {
  it('should return connected when query succeeds', async () => {
    const indicator = new DrizzleHealthIndicator();
    (indicator as any).db = {
      run: async () => undefined,
    };

    const result = await indicator.check();
    assert.equal(result.status, 'connected');
    assert.equal(typeof result.latencyMs, 'number');
  });

  it('should return error with message when query throws Error', async () => {
    const indicator = new DrizzleHealthIndicator();
    (indicator as any).db = {
      run: async () => {
        throw new Error('db down');
      },
    };

    const result = await indicator.check();
    assert.equal(result.status, 'error');
    assert.equal(result.error, 'db down');
  });

  it('should return generic error when query throws non-Error', async () => {
    const indicator = new DrizzleHealthIndicator();
    (indicator as any).db = {
      run: async () => {
        throw 'unknown';
      },
    };

    const result = await indicator.check();
    assert.equal(result.status, 'error');
    assert.equal(result.error, 'Unknown database error');
  });
});
