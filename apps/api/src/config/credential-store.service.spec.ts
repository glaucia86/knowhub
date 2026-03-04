import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CredentialStoreService } from './credential-store.service';

interface KeytarMock {
  getPassword(service: string, account: string): Promise<string | null>;
  setPassword(service: string, account: string, password: string): Promise<void>;
  deletePassword(service: string, account: string): Promise<boolean>;
}

describe('CredentialStoreService', () => {
  it('does not eagerly resolve keytar in constructor', () => {
    let resolveCalls = 0;
    const originalResolve = (CredentialStoreService.prototype as any).resolveKeytar;
    (CredentialStoreService.prototype as any).resolveKeytar = async function () {
      resolveCalls += 1;
      throw new Error('keytar unavailable');
    };

    try {
      new CredentialStoreService();
      assert.equal(resolveCalls, 0);
    } finally {
      (CredentialStoreService.prototype as any).resolveKeytar = originalResolve;
    }
  });

  it('resolves keytar lazily on first access and caches it', async () => {
    let resolveCalls = 0;
    const keytar: KeytarMock = {
      getPassword: async () => 'secret',
      setPassword: async () => undefined,
      deletePassword: async () => true,
    };

    const originalResolve = (CredentialStoreService.prototype as any).resolveKeytar;
    (CredentialStoreService.prototype as any).resolveKeytar = async function () {
      resolveCalls += 1;
      return keytar;
    };

    try {
      const service = new CredentialStoreService();
      const first = await service.getSecret('knowhub-client-secret', 'client-1');
      const second = await service.getSecret('knowhub-client-secret', 'client-1');

      assert.equal(first, 'secret');
      assert.equal(second, 'secret');
      assert.equal(resolveCalls, 1);
    } finally {
      (CredentialStoreService.prototype as any).resolveKeytar = originalResolve;
    }
  });
});
