import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { createDatabaseClient } from './database.client';

describe('createDatabaseClient', () => {
  it('creates parent directory for sqlite database path when missing', () => {
    const testRoot = mkdtempSync(path.join(tmpdir(), 'knowhub-db-client-'));
    const nestedDir = path.resolve(testRoot, 'nested', 'path');
    const databasePath = path.resolve(nestedDir, 'local.db');

    try {
      assert.equal(existsSync(nestedDir), false);

      const client = createDatabaseClient(databasePath);
      client.close();

      assert.equal(existsSync(nestedDir), true);
      assert.equal(existsSync(databasePath), true);
    } finally {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });
});
