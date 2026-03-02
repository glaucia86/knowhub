import { existsSync } from 'node:fs';
import path from 'node:path';

function resolveApiWorkspaceRoot(): string {
  const nestedWorkspace = path.resolve(process.cwd(), 'apps', 'api');
  if (existsSync(path.join(nestedWorkspace, 'package.json'))) {
    return nestedWorkspace;
  }
  return process.cwd();
}

export const API_WORKSPACE_ROOT = resolveApiWorkspaceRoot();

function resolveDatabasePathFromEnv(databaseUrl: string | undefined): string {
  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return path.resolve(API_WORKSPACE_ROOT, 'local.db');
  }

  const normalized = databaseUrl.trim();
  const withoutFilePrefix = normalized.startsWith('file:') ? normalized.slice(5) : normalized;
  if (path.isAbsolute(withoutFilePrefix)) {
    return withoutFilePrefix;
  }

  return path.resolve(API_WORKSPACE_ROOT, withoutFilePrefix);
}

export const LOCAL_DATABASE_PATH = resolveDatabasePathFromEnv(process.env.DATABASE_URL);
export const LOCAL_MIGRATIONS_PATH = path.resolve(API_WORKSPACE_ROOT, 'src', 'db', 'migrations');
