interface KeytarLike {
  getPassword(service: string, account: string): Promise<string | null>;
  setPassword(service: string, account: string, password: string): Promise<void>;
  deletePassword(service: string, account: string): Promise<boolean>;
}

export class SetupCredentialStoreService {
  private readonly keytarChunkSize = 1000;

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

  async storeClientSecret(clientId: string, clientSecret: string): Promise<void> {
    const keytar = await this.resolveKeytar();
    await keytar.setPassword('knowhub', clientId, clientSecret);
  }

  async storePrivateKey(clientId: string, privateKeyPem: string): Promise<void> {
    const keytar = await this.resolveKeytar();
    const chunks = this.chunkSecret(privateKeyPem);
    await keytar.setPassword(
      'knowhub-rsa-meta',
      clientId,
      JSON.stringify({ chunks: chunks.length }),
    );
    for (let index = 0; index < chunks.length; index += 1) {
      await keytar.setPassword('knowhub-rsa', `${clientId}:${index}`, chunks[index]);
    }
    await keytar.deletePassword('knowhub-rsa', clientId);
  }

  async cleanupClientCredentials(clientId: string): Promise<void> {
    const keytar = await this.resolveKeytar();
    await keytar.deletePassword('knowhub', clientId);

    const metaRaw = await keytar.getPassword('knowhub-rsa-meta', clientId);
    if (metaRaw) {
      try {
        const parsed = JSON.parse(metaRaw) as { chunks?: number };
        const chunkCount = parsed.chunks ?? 0;
        for (let index = 0; index < chunkCount; index += 1) {
          await keytar.deletePassword('knowhub-rsa', `${clientId}:${index}`);
        }
      } catch {
        // ignore malformed metadata and continue cleaning known keys
      }
      await keytar.deletePassword('knowhub-rsa-meta', clientId);
    }

    await keytar.deletePassword('knowhub-rsa', clientId);
  }

  private chunkSecret(secret: string): string[] {
    const chunks: string[] = [];
    for (let index = 0; index < secret.length; index += this.keytarChunkSize) {
      chunks.push(secret.slice(index, index + this.keytarChunkSize));
    }
    return chunks;
  }
}
