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
export const LOCAL_DATABASE_PATH = path.resolve(API_WORKSPACE_ROOT, 'local.db');
export const LOCAL_MIGRATIONS_PATH = path.resolve(API_WORKSPACE_ROOT, 'src', 'db', 'migrations');
