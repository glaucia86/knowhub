import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

function createUserLookupDb(rows: Array<{ id: string }>) {
  return {
    select: () => ({
      from: () => ({
        limit: async () => rows,
      }),
    }),
  };
}

function setServiceDb(service: AuthService, rows: Array<{ id: string }>) {
  (service as any).db = createUserLookupDb(rows);
}

describe('AuthService', () => {
  it('should reject invalid credentials', async () => {
    const auditEvents: string[] = [];
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      {
        getSecret: async (serviceName: string) =>
          serviceName === 'knowhub' ? 'expected' : 'private',
      } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      {
        record: async (eventType: string) => {
          auditEvents.push(eventType);
        },
      } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await assert.rejects(
      () => service.issueTokenPair('client-1', 'wrong-secret'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
    assert.deepEqual(auditEvents, ['auth_failed']);
  });

  it('should reject when expected secret is missing', async () => {
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      {
        getSecret: async () => null,
      } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await assert.rejects(
      () => service.issueTokenPair('client-1', 'any'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
  });

  it('should reject when no local user is provisioned', async () => {
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      {
        getSecret: async (serviceName: string) =>
          serviceName === 'knowhub' ? 'secret-1' : 'private',
      } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, []);

    await assert.rejects(
      () => service.issueTokenPair('client-1', 'secret-1'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
  });

  it('should reject when signing key is missing', async () => {
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      {
        getSecret: async (serviceName: string) => (serviceName === 'knowhub' ? 'secret-1' : null),
      } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await assert.rejects(
      () => service.issueTokenPair('client-1', 'secret-1'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
  });

  it('should issue tokens and persist refresh token', async () => {
    const auditEvents: string[] = [];
    const created: Array<{ userId: string; clientId: string; tokenHash: string }> = [];
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      {
        getSecret: async (serviceName: string) =>
          serviceName === 'knowhub' ? 'secret-1' : 'private-key-pem',
      } as never,
      {
        create: async (record: { userId: string; clientId: string; tokenHash: string }) => {
          created.push(record);
        },
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      {
        record: async (eventType: string) => {
          auditEvents.push(eventType);
        },
      } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    const pair = await service.issueTokenPair('client-1', 'secret-1');

    assert.equal(pair.accessToken, 'access-token');
    assert.equal(pair.tokenType, 'Bearer');
    assert.equal(typeof pair.refreshToken, 'string');
    assert.equal(created.length, 1);
    assert.equal(created[0]?.userId, 'u1');
    assert.equal(created[0]?.clientId, 'client-1');
    assert.equal(created[0]?.tokenHash.length, 64);
    assert.deepEqual(auditEvents, ['token_issued']);
  });

  it('should reject invalid refresh token', async () => {
    const auditEvents: string[] = [];
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      { getSecret: async () => 'private-key-pem' } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      {
        record: async (eventType: string) => {
          auditEvents.push(eventType);
        },
      } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await assert.rejects(
      () => service.refreshSession('invalid-refresh'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
    assert.deepEqual(auditEvents, ['auth_failed']);
  });

  it('should rotate refresh token on refresh flow', async () => {
    const revoked: Array<{ id: string; reason: string; replacedBy?: string }> = [];
    const created: Array<{ id: string }> = [];
    const service = new AuthService(
      { signAsync: async () => 'new-access-token' } as never,
      { getSecret: async () => 'private-key-pem' } as never,
      {
        create: async (record: { id: string }) => {
          created.push(record);
        },
        findActiveByTokenHash: async () => ({
          id: 'old-refresh-id',
          userId: 'user-1',
          clientId: 'client-1',
          tokenHash: 'hash',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
          replacedByTokenId: null,
          revokeReason: null,
        }),
        revoke: async (id: string, reason: string, replacedBy?: string) => {
          revoked.push({ id, reason, replacedBy });
        },
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    const pair = await service.refreshSession('valid-refresh');

    assert.equal(pair.accessToken, 'new-access-token');
    assert.equal(revoked.length, 1);
    assert.equal(revoked[0]?.id, 'old-refresh-id');
    assert.equal(revoked[0]?.reason, 'rotated');
    assert.equal(revoked[0]?.replacedBy, created[0]?.id);
  });

  it('should not perform second refresh-token lookup during rotation', async () => {
    let lookupCalls = 0;
    const service = new AuthService(
      { signAsync: async () => 'new-access-token' } as never,
      { getSecret: async () => 'private-key-pem' } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => {
          lookupCalls += 1;
          return {
            id: 'old-refresh-id',
            userId: 'user-1',
            clientId: 'client-1',
            tokenHash: 'hash',
            issuedAt: new Date(),
            expiresAt: new Date(Date.now() + 60_000),
            revokedAt: null,
            replacedByTokenId: null,
            revokeReason: null,
          };
        },
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await service.refreshSession('valid-refresh');

    assert.equal(lookupCalls, 1);
  });

  it('should reject refresh when private key is missing', async () => {
    const service = new AuthService(
      { signAsync: async () => 'new-access-token' } as never,
      { getSecret: async () => null } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => ({
          id: 'old-refresh-id',
          userId: 'user-1',
          clientId: 'client-1',
          tokenHash: 'hash',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
          replacedByTokenId: null,
          revokeReason: null,
        }),
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await assert.rejects(
      () => service.refreshSession('valid-refresh'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
  });

  it('should revoke refresh token on logout', async () => {
    const revoked: Array<{ id: string; reason: string }> = [];
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      { getSecret: async () => 'private-key-pem' } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => ({
          id: 'refresh-id',
          userId: 'user-1',
          clientId: 'client-1',
          tokenHash: 'hash',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60_000),
          revokedAt: null,
          replacedByTokenId: null,
          revokeReason: null,
        }),
        revoke: async (id: string, reason: string) => {
          revoked.push({ id, reason });
        },
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await service.logout('refresh');

    assert.equal(revoked.length, 1);
    assert.equal(revoked[0]?.id, 'refresh-id');
    assert.equal(revoked[0]?.reason, 'logout');
  });

  it('should reject logout when refresh token is invalid', async () => {
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      { getSecret: async () => 'private-key-pem' } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    await assert.rejects(
      () => service.logout('missing'),
      (error: unknown) => error instanceof UnauthorizedException,
    );
  });

  it('should expose helper behavior for secret comparison and latency stabilization', async () => {
    const service = new AuthService(
      { signAsync: async () => 'access-token' } as never,
      { getSecret: async () => 'secret-1' } as never,
      {
        create: async () => undefined,
        findActiveByTokenHash: async () => null,
        revoke: async () => undefined,
      } as never,
      { record: async () => undefined } as never,
    );
    setServiceDb(service, [{ id: 'u1' }]);

    const serviceAny = service as any;
    assert.equal(serviceAny.safeCompareSecret('same', 'same'), true);
    assert.equal(serviceAny.safeCompareSecret('same', 'other'), false);
    await serviceAny.stabilizeFailedAuthLatency(Date.now());
    await serviceAny.stabilizeFailedAuthLatency(Date.now() - 200);
  });
});
