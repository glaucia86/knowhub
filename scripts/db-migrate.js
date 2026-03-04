#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

function resolveApiRoot() {
  const fromRoot = path.resolve(process.cwd(), 'apps', 'api');
  if (fs.existsSync(path.join(fromRoot, 'package.json'))) {
    return fromRoot;
  }
  return process.cwd();
}

const apiRoot = resolveApiRoot();

function resolveDatabaseFile() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    return path.resolve(apiRoot, 'local.db');
  }

  const normalized = value.startsWith('file:') ? value.slice(5) : value;
  return path.isAbsolute(normalized) ? normalized : path.resolve(apiRoot, normalized);
}

const databaseFile = resolveDatabaseFile();
const migrationsDir = path.resolve(apiRoot, 'src', 'db', 'migrations');

if (!fs.existsSync(migrationsDir)) {
  console.error(`[db:migrate] pasta de migrations nao encontrada: ${migrationsDir}`);
  process.exit(1);
}

const migrationFiles = fs
  .readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b));

const db = new Database(databaseFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS __kh_migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at INTEGER NOT NULL
  );
`);

const appliedRows = db.prepare('SELECT name FROM __kh_migrations').all();
const appliedSet = new Set(appliedRows.map((row) => row.name));

let appliedCount = 0;
let skippedCount = 0;

for (const filename of migrationFiles) {
  if (appliedSet.has(filename)) {
    skippedCount += 1;
    continue;
  }

  const sqlPath = path.resolve(migrationsDir, filename);
  const sql = fs.readFileSync(sqlPath, 'utf8').trim();
  if (!sql) {
    skippedCount += 1;
    continue;
  }

  const tx = db.transaction(() => {
    db.exec(sql);
    db.prepare('INSERT INTO __kh_migrations (name, applied_at) VALUES (?, ?)').run(filename, Date.now());
  });

  tx();
  appliedCount += 1;
  console.log(`[db:migrate] aplicado: ${filename}`);
}

db.close();
console.log(`[db:migrate] concluido (aplicadas=${appliedCount}, puladas=${skippedCount})`);
