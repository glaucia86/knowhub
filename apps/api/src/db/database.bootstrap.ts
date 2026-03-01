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

function readMigrationJournal(): MigrationJournal {
  const journalPath = ensureMigrationsMeta();
  return JSON.parse(readFileSync(journalPath, 'utf8')) as MigrationJournal;
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

function applyPendingMigrations(): { applied: number; skipped: number } {
  const client = getDatabaseClient();

  client.sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __kh_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    );
  `);

  const appliedRows = client.sqlite.prepare('SELECT name FROM __kh_migrations').all() as Array<{
    name: string;
  }>;
  const appliedSet = new Set(appliedRows.map((row) => row.name));
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

    const tx = client.sqlite.transaction(() => {
      client.sqlite.exec(sql);
      client.sqlite
        .prepare('INSERT INTO __kh_migrations (name, applied_at) VALUES (?, ?)')
        .run(filename, Date.now());
    });

    tx();
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
  const journal = readMigrationJournal();
  const currentVersion =
    journal.entries.length > 0 ? journal.entries[journal.entries.length - 1].tag : '0';
  return {
    currentVersion,
    pendingMigrations: 0,
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
