import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { LOCAL_DATABASE_PATH } from './index';

export interface LocalDatabaseClient {
  sqlite: Database.Database;
  db: BetterSQLite3Database<typeof schema>;
  close: () => void;
}

let cachedClient: LocalDatabaseClient | null = null;

export function createDatabaseClient(databasePath = LOCAL_DATABASE_PATH): LocalDatabaseClient {
  const sqlite = new Database(databasePath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

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
