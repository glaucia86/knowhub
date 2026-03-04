import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import Database from 'better-sqlite3';
import { SetupBootstrapService } from '../../lib/setup/setup-bootstrap.service';

describe('SetupBootstrapService', () => {
  it('should bootstrap user and settings idempotently', () => {
    const dbPath = path.resolve(tmpdir(), `knowhub-test-${randomUUID()}.db`);
    const sqlite = new Database(dbPath);

    sqlite.exec(`
      CREATE TABLE users (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        created_at integer NOT NULL,
        updated_at integer NOT NULL
      );
      CREATE TABLE user_settings (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL UNIQUE,
        ai_provider text NOT NULL,
        ai_model text NOT NULL,
        embedding_model text NOT NULL,
        privacy_mode integer NOT NULL,
        language text NOT NULL,
        telegram_enabled integer NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
      );
    `);
    sqlite.close();

    try {
      const service = new SetupBootstrapService();
      service.bootstrap(dbPath, 'Usuario Teste');
      service.bootstrap(dbPath, 'Usuario Teste 2');

      const db = new Database(dbPath);
      const usersCount = db.prepare('SELECT count(*) as c FROM users').get() as { c: number };
      const settingsCount = db.prepare('SELECT count(*) as c FROM user_settings').get() as {
        c: number;
      };
      const user = db.prepare('SELECT name FROM users LIMIT 1').get() as { name: string };
      db.close();

      assert.equal(usersCount.c, 1);
      assert.equal(settingsCount.c, 1);
      assert.equal(user.name, 'Usuario Teste 2');
    } finally {
      if (existsSync(dbPath)) {
        rmSync(dbPath, { force: true });
      }
    }
  });
});
