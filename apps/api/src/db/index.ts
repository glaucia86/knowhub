import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

function resolveApiWorkspaceRoot(): string {
  const nestedWorkspace = path.resolve(process.cwd(), 'apps', 'api');
  if (existsSync(path.join(nestedWorkspace, 'package.json'))) {
    return nestedWorkspace;
  }
  return process.cwd();
}

export const API_WORKSPACE_ROOT = resolveApiWorkspaceRoot();
const KNOWHUB_DATABASE_RELATIVE_PATH = path.join('.knowhub', 'data', 'knowhub.db');

export interface ResolveDatabasePathOptions {
  apiWorkspaceRoot?: string;
  homeDirectory?: string;
}

export function resolveDatabasePathFromEnv(
  databaseUrl: string | undefined,
  options: ResolveDatabasePathOptions = {},
): string {
  const apiWorkspaceRoot = options.apiWorkspaceRoot ?? API_WORKSPACE_ROOT;
  const homeDirectory = options.homeDirectory ?? homedir();
  const defaultDatabasePath = path.resolve(homeDirectory, KNOWHUB_DATABASE_RELATIVE_PATH);

  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return defaultDatabasePath;
  }

  const normalized = databaseUrl.trim();
  if (normalized === ':memory:') {
    return normalized;
  }
  const withoutFilePrefix = normalized.startsWith('file:') ? normalized.slice(5) : normalized;
  const withExpandedHome =
    withoutFilePrefix === '~' || withoutFilePrefix.startsWith('~/')
      ? path.resolve(homeDirectory, withoutFilePrefix.slice(2))
      : withoutFilePrefix;
  if (path.isAbsolute(withExpandedHome)) {
    return withExpandedHome;
  }

  return path.resolve(apiWorkspaceRoot, withExpandedHome);
}

export const LOCAL_DATABASE_PATH = resolveDatabasePathFromEnv(process.env.DATABASE_URL);
export const LOCAL_MIGRATIONS_PATH = path.resolve(API_WORKSPACE_ROOT, 'src', 'db', 'migrations');
