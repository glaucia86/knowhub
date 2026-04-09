import { execSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

export interface SetupConfigWriteResult {
  configPath: string;
  publicKeyPath: string;
  knowhubDir: string;
  dataDir: string;
}

export class SetupConfigWriterService {
  private readonly knowhubDir = path.resolve(homedir(), '.knowhub');
  private readonly dataDir = path.resolve(this.knowhubDir, 'data');
  private readonly configPath = path.resolve(this.knowhubDir, 'config.json');
  private readonly publicKeyPath = path.resolve(this.knowhubDir, 'public.pem');

  isAlreadyConfigured(): boolean {
    return existsSync(this.configPath);
  }

  readExistingClientId(): string | null {
    if (!this.isAlreadyConfigured()) {
      return null;
    }

    try {
      const raw = readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(raw) as { clientId?: string };
      return parsed.clientId ?? null;
    } catch {
      return null;
    }
  }

  writeConfig(clientId: string, publicKeyPem: string): SetupConfigWriteResult {
    mkdirSync(this.knowhubDir, { recursive: true });
    mkdirSync(this.dataDir, { recursive: true });

    writeFileSync(this.publicKeyPath, publicKeyPem, 'utf-8');
    const config = {
      clientId,
      publicKeyPath: this.publicKeyPath,
      version: '1',
      createdAt: new Date().toISOString(),
    };
    writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');

    if (process.platform === 'win32') {
      try {
        execSync(`icacls "${this.configPath}" /inheritance:r /grant:r "%USERNAME%:F"`, {
          stdio: 'ignore',
        });
      } catch {
        // no-op: Windows ACL hardening is best effort
      }
    } else {
      chmodSync(this.publicKeyPath, 0o644);
      chmodSync(this.configPath, 0o600);
    }

    return {
      configPath: this.configPath,
      publicKeyPath: this.publicKeyPath,
      knowhubDir: this.knowhubDir,
      dataDir: this.dataDir,
    };
  }
}
