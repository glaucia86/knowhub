#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function resolveApiRoot() {
  const fromRoot = path.resolve(process.cwd(), 'apps', 'api');
  if (fs.existsSync(path.join(fromRoot, 'package.json'))) {
    return fromRoot;
  }
  return process.cwd();
}

const apiRoot = resolveApiRoot();
const databaseFile = path.resolve(apiRoot, 'local.db');
const sidecars = [`${databaseFile}-shm`, `${databaseFile}-wal`];
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmExecPath = process.env.npm_execpath;

if (fs.existsSync(databaseFile)) {
  fs.rmSync(databaseFile);
  console.log(`[db-reset] removido: ${databaseFile}`);
} else {
  console.log(`[db-reset] banco nao encontrado: ${databaseFile}`);
}

for (const file of sidecars) {
  if (fs.existsSync(file)) {
    fs.rmSync(file);
    console.log(`[db-reset] removido: ${file}`);
  }
}

function runNpmScript(scriptName) {
  const useNpmExecPath = typeof npmExecPath === 'string' && npmExecPath.length > 0 && fs.existsSync(npmExecPath);
  const command = useNpmExecPath ? process.execPath : npmCommand;
  const args = useNpmExecPath ? [npmExecPath, 'run', scriptName] : ['run', scriptName];

  const result = spawnSync(command, args, {
    cwd: apiRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`[db-reset] falha ao executar ${scriptName}: ${result.error.message}`);
    return 1;
  }

  return result.status ?? 1;
}

const migrateStatus = runNpmScript('db:migrate');
if (migrateStatus !== 0) {
  process.exit(migrateStatus);
}

const seedStatus = runNpmScript('db:seed');
if (seedStatus !== 0) {
  process.exit(seedStatus);
}

console.log('[db-reset] reset reproduzivel concluido');
