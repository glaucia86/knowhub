import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';

export interface KnowHubLocalConfig {
  clientId: string;
  publicKeyPath: string;
  version: string;
  createdAt?: string;
}

const knowHubConfigSchema = z.object({
  clientId: z.string().uuid(),
  publicKeyPath: z.string().min(1),
  version: z.string().min(1),
  createdAt: z.string().optional(),
});

@Injectable()
export class KnowHubConfigService {
  private readonly configPath: string;

  constructor() {
    this.configPath = path.resolve(homedir(), '.knowhub', 'config.json');
  }

  getConfigPath(): string {
    return this.configPath;
  }

  readLocalConfig(): KnowHubLocalConfig {
    if (!existsSync(this.configPath)) {
      throw new UnauthorizedException(
        `KnowHub config not found at ${this.configPath}. Run setup command first.`,
      );
    }

    const raw = readFileSync(this.configPath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    const validation = knowHubConfigSchema.safeParse(parsed);
    if (!validation.success) {
      throw new UnauthorizedException(
        `Invalid KnowHub config schema. Re-run setup to repair config at ${this.configPath}.`,
      );
    }

    return validation.data;
  }

  toJSON(): string {
    return '[REDACTED]';
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return '[REDACTED]';
  }
}
