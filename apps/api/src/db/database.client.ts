import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { normalizeSearchText } from '@knowhub/shared-utils';
import * as schema from './schema';
import { resolveDatabasePathFromEnv } from './index';

export interface LocalDatabaseClient {
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
  close: () => void;
}

let cachedClient: LocalDatabaseClient | null = null;

function ensureDatabaseDirectory(databasePath: string): void {
  const databaseDirectory = path.dirname(databasePath);
  mkdirSync(databaseDirectory, { recursive: true });
}

export function createDatabaseClient(
  databasePath = resolveDatabasePathFromEnv(process.env.DATABASE_URL),
): LocalDatabaseClient {
  ensureDatabaseDirectory(databasePath);
  const sqlite = new Database(databasePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.function('normalize_search', (value: unknown) => normalizeSearchText(String(value ?? '')));

  const db = drizzle(sqlite, { schema });
  return {
    sqlite,
    db,
    close: () => sqlite.close(),
  };
}

export function getDatabaseClient(): LocalDatabaseClient {
  if (!cachedClient) {
    cachedClient = createDatabaseClient();
  }
  return cachedClient;
}

export function closeDatabaseClient(): void {
  if (cachedClient) {
    cachedClient.close();
    cachedClient = null;
  }
}
