import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

export class SetupMigrationService {
  private resolveMigrationScriptPath(): string {
    const candidates = [
      path.resolve(__dirname, '../../../../../scripts/db-migrate.js'),
      path.resolve(__dirname, '../../../../../../scripts/db-migrate.js'),
      path.resolve(process.cwd(), 'scripts/db-migrate.js'),
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    throw new Error(
      `Nao foi possivel localizar scripts/db-migrate.js (tentativas: ${candidates.join(', ')})`,
    );
  }

  run(databasePath: string): void {
    const scriptPath = this.resolveMigrationScriptPath();
    const result = spawnSync(process.execPath, [scriptPath], {
      env: {
        ...process.env,
        DATABASE_URL: `file:${databasePath}`,
      },
      stdio: 'pipe',
      encoding: 'utf-8',
    });

    if (result.status !== 0) {
      const details = result.stderr || result.stdout || 'unknown migration error';
      throw new Error(`Falha ao executar migrations: ${details}`);
    }
  }
}
