import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { resolveDatabasePathFromEnv } from './index';

describe('resolveDatabasePathFromEnv', () => {
  const apiWorkspaceRoot = path.resolve('/workspace/apps/api');
  const homeDirectory = path.resolve('/home/dev');

  it('uses ~/.knowhub/data/knowhub.db when DATABASE_URL is missing', () => {
    const result = resolveDatabasePathFromEnv(undefined, { apiWorkspaceRoot, homeDirectory });
    assert.equal(result, path.resolve(homeDirectory, '.knowhub', 'data', 'knowhub.db'));
  });

  it('expands file:~/... using home directory', () => {
    const result = resolveDatabasePathFromEnv('file:~/.knowhub/data/knowhub.db', {
      apiWorkspaceRoot,
      homeDirectory,
    });
    assert.equal(result, path.resolve(homeDirectory, '.knowhub', 'data', 'knowhub.db'));
  });

  it('keeps absolute database path untouched', () => {
    const absoluteDatabasePath = path.resolve('/tmp/knowhub.db');
    const result = resolveDatabasePathFromEnv(`file:${absoluteDatabasePath}`, {
      apiWorkspaceRoot,
      homeDirectory,
    });
    assert.equal(result, absoluteDatabasePath);
  });

  it('resolves relative path against API workspace root', () => {
    const result = resolveDatabasePathFromEnv('./local.db', { apiWorkspaceRoot, homeDirectory });
    assert.equal(result, path.resolve(apiWorkspaceRoot, 'local.db'));
  });
});
