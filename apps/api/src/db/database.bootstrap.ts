import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { closeDatabaseClient, createDatabaseClient, getDatabaseClient } from './database.client';
import { LOCAL_DATABASE_PATH, LOCAL_MIGRATIONS_PATH } from './index';
import { runDevelopmentSeed } from './seed';

interface MigrationJournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface MigrationJournal {
  version: string;
  dialect: string;
  entries: MigrationJournalEntry[];
}

function ensureMigrationsMeta(): string {
  const metaDir = path.resolve(LOCAL_MIGRATIONS_PATH, 'meta');
  const journalPath = path.resolve(metaDir, '_journal.json');
  if (!existsSync(metaDir)) {
    mkdirSync(metaDir, { recursive: true });
  }
  if (!existsSync(journalPath)) {
    const defaultJournal: MigrationJournal = {
      version: '7',
      dialect: 'sqlite',
      entries: [],
    };
    writeFileSync(journalPath, JSON.stringify(defaultJournal, null, 2), 'utf8');
  }
  return journalPath;
}

function listSqlMigrations(): string[] {
  if (!existsSync(LOCAL_MIGRATIONS_PATH)) {
    return [];
  }

  return readdirSync(LOCAL_MIGRATIONS_PATH, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function ensureMigrationTrackingTable(): void {
  const client = getDatabaseClient();
  client.sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __kh_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    );
  `);
}

function getAppliedMigrationNames(): string[] {
  const client = getDatabaseClient();
  const rows = client.sqlite
    .prepare('SELECT name FROM __kh_migrations ORDER BY name ASC')
    .all() as Array<{
    name: string;
  }>;
  return rows.map((row) => row.name);
}

function applyPendingMigrations(): { applied: number; skipped: number } {
  const client = getDatabaseClient();
  ensureMigrationTrackingTable();
  const appliedSet = new Set(getAppliedMigrationNames());
  const files = listSqlMigrations();

  let applied = 0;
  let skipped = 0;

  for (const filename of files) {
    if (appliedSet.has(filename)) {
      skipped += 1;
      continue;
    }

    const sqlPath = path.resolve(LOCAL_MIGRATIONS_PATH, filename);
    const sql = readFileSync(sqlPath, 'utf8').trim();
    if (!sql) {
      skipped += 1;
      continue;
    }

    client.sqlite.exec(sql);
    client.sqlite
      .prepare('INSERT INTO __kh_migrations (name, applied_at) VALUES (?, ?)')
      .run(filename, Date.now());
    applied += 1;
  }

  return { applied, skipped };
}

export function bootstrapLocalDatabase(): { currentVersion: string; pendingMigrations: number } {
  ensureMigrationsMeta();
  applyPendingMigrations();
  return getSchemaVersionInfo();
}

export function getSchemaVersionInfo(): { currentVersion: string; pendingMigrations: number } {
  ensureMigrationsMeta();
  ensureMigrationTrackingTable();

  const files = listSqlMigrations();
  const appliedSet = new Set(getAppliedMigrationNames());
  const appliedFiles = files.filter((filename) => appliedSet.has(filename));
  const pendingMigrations = files.filter((filename) => !appliedSet.has(filename)).length;

  const currentVersion =
    appliedFiles.length > 0 ? appliedFiles[appliedFiles.length - 1].replace(/\.sql$/, '') : '0';

  return {
    currentVersion,
    pendingMigrations,
  };
}

export function resetLocalDatabase(options?: { includeSeed?: boolean }): {
  currentVersion: string;
  seeded: boolean;
} {
  closeDatabaseClient();
  if (existsSync(LOCAL_DATABASE_PATH)) {
    rmSync(LOCAL_DATABASE_PATH);
  }

  const ephemeralClient = createDatabaseClient();
  ephemeralClient.close();
  applyPendingMigrations();

  if (options?.includeSeed ?? true) {
    runDevelopmentSeed();
  }

  return {
    ...getSchemaVersionInfo(),
    seeded: options?.includeSeed ?? true,
  };
}
