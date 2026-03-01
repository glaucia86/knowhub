#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const targets = [
  { label: 'root', example: '.env.example', env: '.env' },
  { label: 'api', example: path.join('apps', 'api', '.env.example'), env: path.join('apps', 'api', '.env') },
  { label: 'web', example: path.join('apps', 'web', '.env.example'), env: path.join('apps', 'web', '.env') },
];

function parseEnv(content) {
  const result = new Map();
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }
    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);
    result.set(key, value);
  }
  return result;
}

function normalizeValue(value) {
  return value === '__GENERATE_SECRET__' ? crypto.randomBytes(24).toString('hex') : value;
}

function shouldGenerateSecret(exampleValue, currentValue) {
  if (exampleValue !== '__GENERATE_SECRET__') {
    return false;
  }
  if (currentValue === undefined) {
    return true;
  }
  const trimmed = currentValue.trim();
  return trimmed.length === 0 || trimmed === '__GENERATE_SECRET__';
}

function serializeEnv(entries) {
  return `${entries.map(([key, value]) => `${key}=${value}`).join('\n')}\n`;
}

function ensureEnvFile(target) {
  const examplePath = path.resolve(target.example);
  const envPath = path.resolve(target.env);

  if (!fs.existsSync(examplePath)) {
    return { label: target.label, status: 'skipped', detail: `${target.example} ausente` };
  }

  const exampleMap = parseEnv(fs.readFileSync(examplePath, 'utf8'));

  if (!fs.existsSync(envPath)) {
    const generated = Array.from(exampleMap.entries()).map(([key, value]) => [key, normalizeValue(value)]);
    fs.writeFileSync(envPath, serializeEnv(generated), 'utf8');
    return { label: target.label, status: 'created', detail: target.env };
  }

  const currentMap = parseEnv(fs.readFileSync(envPath, 'utf8'));
  let appended = 0;
  let regenerated = 0;
  for (const [key, value] of exampleMap.entries()) {
    if (!currentMap.has(key)) {
      currentMap.set(key, normalizeValue(value));
      appended += 1;
      continue;
    }

    if (shouldGenerateSecret(value, currentMap.get(key))) {
      currentMap.set(key, normalizeValue(value));
      regenerated += 1;
    }
  }

  if (appended > 0 || regenerated > 0) {
    fs.writeFileSync(envPath, serializeEnv(Array.from(currentMap.entries())), 'utf8');
  }

  return {
    label: target.label,
    status: appended > 0 || regenerated > 0 ? 'updated' : 'ok',
    detail:
      appended > 0 || regenerated > 0
        ? `${appended} variaveis adicionadas, ${regenerated} segredos gerados`
        : 'sem alteracoes',
  };
}

const results = targets.map(ensureEnvFile);
for (const result of results) {
  console.log(`[env-setup] ${result.label}: ${result.status} (${result.detail})`);
}
