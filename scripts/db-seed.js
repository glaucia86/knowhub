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
const databaseFile = path.resolve(apiRoot, 'local.db');

if (!fs.existsSync(databaseFile)) {
  console.error(`[db:seed] banco nao encontrado: ${databaseFile}`);
  console.error('[db:seed] execute db:migrate antes do seed');
  process.exit(1);
}

const db = new Database(databaseFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const now = Date.now();
const userId = 'dev-user-1';

const tx = db.transaction(() => {
  db.prepare(
    `
      INSERT INTO users (id, name, email, created_at, updated_at)
      VALUES (@id, @name, @email, @createdAt, @updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        updated_at = excluded.updated_at;
    `,
  ).run({
    id: userId,
    name: 'KnowHub Dev',
    email: 'dev@knowhub.local',
    createdAt: now,
    updatedAt: now,
  });

  db.prepare(
    `
      INSERT INTO user_settings (
        id, user_id, ai_provider, ai_model, embedding_model, privacy_mode, language, telegram_enabled
      ) VALUES (
        @id, @userId, @aiProvider, @aiModel, @embeddingModel, @privacyMode, @language, @telegramEnabled
      )
      ON CONFLICT(user_id) DO UPDATE SET
        ai_provider = excluded.ai_provider,
        ai_model = excluded.ai_model,
        embedding_model = excluded.embedding_model,
        privacy_mode = excluded.privacy_mode,
        language = excluded.language,
        telegram_enabled = excluded.telegram_enabled;
    `,
  ).run({
    id: 'dev-settings-1',
    userId,
    aiProvider: process.env.LOCAL_AI_PROVIDER || 'ollama',
    aiModel: process.env.OLLAMA_DEFAULT_MODEL || 'qwen2.5:3b',
    embeddingModel: 'nomic-embed-text',
    privacyMode: 1,
    language: 'pt-BR',
    telegramEnabled: 0,
  });

  const entries = [
    [
      'entry-note-1',
      userId,
      'NOTE',
      'Boas praticas de onboarding',
      'Fluxo local com env setup, compose up e bootstrap de banco.',
      null,
      null,
      'active',
      now,
      now,
    ],
    [
      'entry-link-1',
      userId,
      'LINK',
      'NestJS docs',
      'Referencia para controllers e modules.',
      'https://docs.nestjs.com',
      null,
      'active',
      now,
      now,
    ],
    [
      'entry-pdf-1',
      userId,
      'PDF',
      'PRD EPIC-0.3',
      'Escopo do onboarding local.',
      null,
      'docs-specs/PRD-EPIC-0.3.md',
      'active',
      now,
      now,
    ],
  ];

  const upsertEntry = db.prepare(
    `
      INSERT INTO knowledge_entries (
        id, user_id, type, title, content, source_url, file_path, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        source_url = excluded.source_url,
        file_path = excluded.file_path,
        status = excluded.status,
        updated_at = excluded.updated_at;
    `,
  );
  for (const entry of entries) {
    upsertEntry.run(...entry);
  }

  db.prepare(
    `
      INSERT INTO content_chunks (id, entry_id, chunk_index, content, token_count)
      VALUES (@id, @entryId, @chunkIndex, @content, @tokenCount)
      ON CONFLICT(entry_id, chunk_index) DO UPDATE SET
        content = excluded.content,
        token_count = excluded.token_count;
    `,
  ).run({
    id: 'chunk-note-1-0',
    entryId: 'entry-note-1',
    chunkIndex: 0,
    content: 'Fluxo local com env setup, compose up e bootstrap de banco.',
    tokenCount: 16,
  });

  db.prepare(
    `
      INSERT INTO tags (id, name, user_id)
      VALUES (@id, @name, @userId)
      ON CONFLICT(name, user_id) DO NOTHING;
    `,
  ).run({
    id: 'tag-onboarding',
    name: 'onboarding',
    userId,
  });

  db.prepare(
    `
      INSERT INTO connection_edges (id, source_id, target_id, similarity, type, created_at)
      VALUES (@id, @sourceId, @targetId, @similarity, @type, @createdAt)
      ON CONFLICT(source_id, target_id) DO UPDATE SET
        similarity = excluded.similarity,
        type = excluded.type;
    `,
  ).run({
    id: 'edge-1',
    sourceId: 'entry-note-1',
    targetId: 'entry-link-1',
    similarity: 0.79,
    type: 'reference',
    createdAt: now,
  });

  db.prepare(
    `
      INSERT INTO maintenance_jobs (id, type, status, payload, result, created_at, completed_at)
      VALUES (@id, @type, @status, @payload, @result, @createdAt, @completedAt)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        payload = excluded.payload,
        result = excluded.result,
        completed_at = excluded.completed_at;
    `,
  ).run({
    id: 'job-initial-index',
    type: 'reindex',
    status: 'completed',
    payload: JSON.stringify({ reason: 'initial-seed' }),
    result: JSON.stringify({ chunksIndexed: 1 }),
    createdAt: now,
    completedAt: now,
  });
});

tx();
db.close();

console.log('[db:seed] concluido (users=1, entries=3, edges=1)');
