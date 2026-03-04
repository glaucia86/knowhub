import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { RefreshTokenRepository } from './refresh-token.repository';

describe('RefreshTokenRepository helpers', () => {
  it('should hash token deterministically', () => {
    const token = 'sample-refresh-token';
    const hashA = RefreshTokenRepository.hashToken(token);
    const hashB = RefreshTokenRepository.hashToken(token);
    assert.equal(hashA, hashB);
  });

  it('should compare hashes safely', () => {
    const hash = RefreshTokenRepository.hashToken('a');
    const same = RefreshTokenRepository.safeEqualHash(hash, hash);
    const different = RefreshTokenRepository.safeEqualHash(
      hash,
      RefreshTokenRepository.hashToken('b'),
    );

    assert.equal(same, true);
    assert.equal(different, false);
  });
});
