import { Injectable } from '@nestjs/common';

interface KeytarLike {
  getPassword(service: string, account: string): Promise<string | null>;
  setPassword(service: string, account: string, password: string): Promise<void>;
  deletePassword(service: string, account: string): Promise<boolean>;
}

@Injectable()
export class CredentialStoreService {
  private readonly keytarPromise: Promise<KeytarLike>;
  private readonly keytarChunkSize = 1000;

  constructor() {
    this.keytarPromise = this.resolveKeytar();
  }

  private async resolveKeytar(): Promise<KeytarLike> {
    try {
      const keytar = (await import('keytar')) as KeytarLike;
      return keytar;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      throw new Error(
        `OS Credential Store indisponivel. Instale/configure keytar para continuar: ${message}`,
      );
    }
  }

  async getSecret(service: string, account: string): Promise<string | null> {
    const keytar = await this.keytarPromise;
    if (service === 'knowhub-rsa') {
      return this.getChunkedSecret(keytar, account);
    }
    return keytar.getPassword(service, account);
  }

  async setSecret(service: string, account: string, secret: string): Promise<void> {
    const keytar = await this.keytarPromise;
    if (service === 'knowhub-rsa') {
      await this.setChunkedSecret(keytar, account, secret);
      return;
    }
    await keytar.setPassword(service, account, secret);
  }

  async deleteSecret(service: string, account: string): Promise<boolean> {
    const keytar = await this.keytarPromise;
    if (service === 'knowhub-rsa') {
      return this.deleteChunkedSecret(keytar, account);
    }
    return keytar.deletePassword(service, account);
  }

  private async getChunkedSecret(keytar: KeytarLike, account: string): Promise<string | null> {
    const legacy = await keytar.getPassword('knowhub-rsa', account);
    if (legacy) {
      return legacy;
    }

    const metaRaw = await keytar.getPassword('knowhub-rsa-meta', account);
    if (!metaRaw) {
      return null;
    }

    let chunkCount = 0;
    try {
      const parsed = JSON.parse(metaRaw) as { chunks?: number };
      chunkCount = parsed.chunks ?? 0;
    } catch {
      return null;
    }

    if (chunkCount <= 0) {
      return null;
    }

    const chunks: string[] = [];
    for (let index = 0; index < chunkCount; index += 1) {
      const part = await keytar.getPassword('knowhub-rsa', `${account}:${index}`);
      if (!part) {
        return null;
      }
      chunks.push(part);
    }
    return chunks.join('');
  }

  private async setChunkedSecret(
    keytar: KeytarLike,
    account: string,
    secret: string,
  ): Promise<void> {
    const chunks = this.chunkSecret(secret);
    await keytar.setPassword(
      'knowhub-rsa-meta',
      account,
      JSON.stringify({ chunks: chunks.length }),
    );
    for (let index = 0; index < chunks.length; index += 1) {
      await keytar.setPassword('knowhub-rsa', `${account}:${index}`, chunks[index]);
    }
    await keytar.deletePassword('knowhub-rsa', account);
  }

  private async deleteChunkedSecret(keytar: KeytarLike, account: string): Promise<boolean> {
    const metaRaw = await keytar.getPassword('knowhub-rsa-meta', account);
    let removed = false;
    if (metaRaw) {
      try {
        const parsed = JSON.parse(metaRaw) as { chunks?: number };
        const chunkCount = parsed.chunks ?? 0;
        for (let index = 0; index < chunkCount; index += 1) {
          const chunkRemoved = await keytar.deletePassword('knowhub-rsa', `${account}:${index}`);
          removed = removed || chunkRemoved;
        }
      } catch {
        // ignore malformed metadata and continue cleaning known keys
      }
      const metaRemoved = await keytar.deletePassword('knowhub-rsa-meta', account);
      removed = removed || metaRemoved;
    }
    const legacyRemoved = await keytar.deletePassword('knowhub-rsa', account);
    return removed || legacyRemoved;
  }

  private chunkSecret(secret: string): string[] {
    const chunks: string[] = [];
    for (let index = 0; index < secret.length; index += this.keytarChunkSize) {
      chunks.push(secret.slice(index, index + this.keytarChunkSize));
    }
    return chunks;
  }
}
