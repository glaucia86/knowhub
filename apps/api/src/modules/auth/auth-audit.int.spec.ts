import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AuthAuditService } from './auth-audit.service';

describe('AuthAuditService', () => {
  it('should write structured auth event log without throwing', async () => {
    const messages: string[] = [];
    const service = new AuthAuditService();
    (service as any).logger = {
      log: (message: string) => {
        messages.push(message);
      },
    };

    await service.record('token_issued', 'user-1', 'client-1', { reason: 'test' });

    assert.equal(messages.length, 1);
    const payload = JSON.parse(messages[0] ?? '{}') as {
      eventType: string;
      userId: string;
      clientId: string;
      metadata: { reason: string };
      occurredAt: string;
    };
    assert.equal(payload.eventType, 'token_issued');
    assert.equal(payload.userId, 'user-1');
    assert.equal(payload.clientId, 'client-1');
    assert.equal(payload.metadata.reason, 'test');
    assert.equal(typeof payload.occurredAt, 'string');
  });
});
