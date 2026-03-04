import { randomBytes, randomUUID } from 'node:crypto';
import { generateKeyPairSync } from 'node:crypto';

export interface SetupCryptoArtifacts {
  clientId: string;
  clientSecret: string;
  publicKeyPem: string;
  privateKeyPem: string;
}

export class SetupCryptoService {
  generate(): SetupCryptoArtifacts {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    return {
      clientId: randomUUID(),
      clientSecret: randomBytes(64).toString('hex'),
      publicKeyPem: publicKey,
      privateKeyPem: privateKey,
    };
  }
}
