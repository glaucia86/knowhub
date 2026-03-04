import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RefreshTokenRepository } from './refresh-token.repository';

describe('RefreshTokenRepository', () => {
  it('should create refresh token record', async () => {
    const inserted: Record<string, unknown>[] = [];
    const repository = new RefreshTokenRepository();
    (repository as any).db = {
      insert: () => ({
        values: async (payload: Record<string, unknown>) => {
          inserted.push(payload);
        },
      }),
    };

    await repository.create({
      id: 'rt-1',
      userId: 'u1',
      clientId: 'c1',
      tokenHash: 'hash',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: null,
      replacedByTokenId: null,
      revokeReason: null,
    });

    assert.equal(inserted.length, 1);
    assert.equal(inserted[0]?.id, 'rt-1');
    assert.equal(inserted[0]?.userId, 'u1');
    assert.equal(inserted[0]?.clientId, 'c1');
  });

  it('should return null when active token is not found', async () => {
    const repository = new RefreshTokenRepository();
    (repository as any).db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
          }),
        }),
      }),
    };

    const result = await repository.findActiveByTokenHash('missing');
    assert.equal(result, null);
  });

  it('should map active token row when found', async () => {
    const row = {
      id: 'rt-1',
      userId: 'u1',
      clientId: 'c1',
      tokenHash: 'hash',
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 10_000),
      revokedAt: null,
      replacedByTokenId: null,
      revokeReason: null,
    };

    const repository = new RefreshTokenRepository();
    (repository as any).db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [row],
          }),
        }),
      }),
    };

    const result = await repository.findActiveByTokenHash('present');
    assert.equal(result?.id, 'rt-1');
    assert.equal(result?.userId, 'u1');
    assert.equal(result?.clientId, 'c1');
  });

  it('should revoke token with and without replacement id', async () => {
    const updates: Record<string, unknown>[] = [];
    const repository = new RefreshTokenRepository();
    (repository as any).db = {
      update: () => ({
        set: (payload: Record<string, unknown>) => {
          updates.push(payload);
          return {
            where: async () => undefined,
          };
        },
      }),
    };

    await repository.revoke('rt-1', 'logout');
    await repository.revoke('rt-2', 'rotated', 'rt-3');

    assert.equal(updates.length, 2);
    assert.equal(updates[0]?.revokeReason, 'logout');
    assert.equal(updates[0]?.replacedByTokenId, null);
    assert.equal(updates[1]?.revokeReason, 'rotated');
    assert.equal(updates[1]?.replacedByTokenId, 'rt-3');
  });

  it('should hash and compare token hashes safely', () => {
    const hash = RefreshTokenRepository.hashToken('refresh-token');
    assert.equal(hash.length, 64);
    assert.equal(RefreshTokenRepository.safeEqualHash(hash, hash), true);
    assert.equal(
      RefreshTokenRepository.safeEqualHash(hash, RefreshTokenRepository.hashToken('other')),
      false,
    );
    assert.equal(RefreshTokenRepository.safeEqualHash('aa', ''), false);
  });
});
