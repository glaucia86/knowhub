import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthRateLimitService } from './auth-rate-limit.service';

describe('AuthRateLimitService', () => {
  it('should allow up to 10 requests and block the 11th in the same window', () => {
    const service = new AuthRateLimitService();
    for (let i = 0; i < 10; i += 1) {
      service.checkAndConsume('127.0.0.1');
    }

    assert.throws(() => {
      service.checkAndConsume('127.0.0.1');
    });
  });

  it('should reset bucket after window expiration', () => {
    const service = new AuthRateLimitService();
    const serviceAny = service as any;

    for (let i = 0; i < 10; i += 1) {
      service.checkAndConsume('127.0.0.1');
    }
    serviceAny.buckets.set('127.0.0.1', {
      startedAt: Date.now() - serviceAny.windowMs - 1,
      count: 10,
    });

    assert.doesNotThrow(() => {
      service.checkAndConsume('127.0.0.1');
    });
  });

  it('should fallback to unknown key when ip is empty', () => {
    const service = new AuthRateLimitService();
    assert.doesNotThrow(() => {
      service.checkAndConsume('');
    });
  });
});
