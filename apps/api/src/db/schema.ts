import { sql } from 'drizzle-orm';
import type { EntryMetadata } from '@knowhub/shared-types';
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const timestampColumns = {
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
};

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  ...timestampColumns,
});

export const userSettings = sqliteTable(
  'user_settings',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    aiProvider: text('ai_provider').notNull(),
    aiModel: text('ai_model').notNull(),
    embeddingModel: text('embedding_model').notNull(),
    privacyMode: integer('privacy_mode', { mode: 'boolean' }).notNull().default(true),
    language: text('language').notNull().default('pt-BR'),
    telegramEnabled: integer('telegram_enabled', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => [uniqueIndex('ux_user_settings_user').on(table.userId)],
);

export const knowledgeEntries = sqliteTable(
  'knowledge_entries',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['NOTE', 'LINK', 'PDF', 'GITHUB'] }).notNull(),
    title: text('title').notNull(),
    content: text('content'),
    sourceUrl: text('source_url'),
    filePath: text('file_path'),
    metadata: text('metadata', { mode: 'json' }).$type<EntryMetadata | null>(),
    summary: text('summary'),
    lastError: text('last_error'),
    status: text('status', {
      enum: ['PENDING', 'INDEXING', 'INDEXED', 'ARCHIVED', 'FAILED'],
    }).notNull(),
    createdAt: timestampColumns.createdAt,
    updatedAt: timestampColumns.updatedAt,
    accessedAt: integer('accessed_at', { mode: 'timestamp_ms' }),
    archivedAt: integer('archived_at', { mode: 'timestamp_ms' }),
  },
  (table) => [
    index('ix_knowledge_entries_user_created_id').on(table.userId, table.createdAt, table.id),
    check(
      'ck_entry_source_or_content',
      sql`${table.content} IS NOT NULL OR ${table.sourceUrl} IS NOT NULL OR ${table.filePath} IS NOT NULL`,
    ),
  ],
);

export const contentChunks = sqliteTable(
  'content_chunks',
  {
    id: text('id').primaryKey(),
    entryId: text('entry_id')
      .notNull()
      .references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    tokenCount: integer('token_count').notNull(),
    embedding: text('embedding'),
    embeddingModel: text('embedding_model'),
  },
  (table) => [uniqueIndex('ux_content_chunk_entry_idx').on(table.entryId, table.chunkIndex)],
);

export const refreshTokens = sqliteTable(
  'refresh_tokens',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    clientId: text('client_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    issuedAt: integer('issued_at', { mode: 'timestamp_ms' }).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    revokedAt: integer('revoked_at', { mode: 'timestamp_ms' }),
    replacedByTokenId: text('replaced_by_token_id'),
    revokeReason: text('revoke_reason'),
    ...timestampColumns,
  },
  (table) => [uniqueIndex('ux_refresh_tokens_hash').on(table.tokenHash)],
);

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('ux_tag_name_user').on(table.name, table.userId)],
);

export const entryTags = sqliteTable(
  'entry_tags',
  {
    entryId: text('entry_id')
      .notNull()
      .references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [uniqueIndex('ux_entry_tags_entry_tag').on(table.entryId, table.tagId)],
);

export const connectionEdges = sqliteTable(
  'connection_edges',
  {
    id: text('id').primaryKey(),
    sourceId: text('source_id')
      .notNull()
      .references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
    targetId: text('target_id')
      .notNull()
      .references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
    similarity: real('similarity').notNull(),
    type: text('type').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    uniqueIndex('ux_edge_source_target').on(table.sourceId, table.targetId),
    check('ck_edge_not_self', sql`${table.sourceId} <> ${table.targetId}`),
    check('ck_edge_similarity', sql`${table.similarity} >= 0 AND ${table.similarity} <= 1`),
  ],
);

export const maintenanceJobs = sqliteTable('maintenance_jobs', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  status: text('status', {
    enum: ['queued', 'running', 'completed', 'failed', 'PENDING_STUB'],
  }).notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  entryId: text('entry_id').references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
  payload: text('payload'),
  result: text('result'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
});

export const indexingCheckpoints = sqliteTable(
  'indexing_checkpoints',
  {
    id: text('id').primaryKey(),
    entryId: text('entry_id')
      .notNull()
      .references(() => knowledgeEntries.id, { onDelete: 'cascade' }),
    threadId: text('thread_id').notNull().unique(),
    checkpoint: text('checkpoint').notNull(),
    step: text('step').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [uniqueIndex('ux_checkpoint_entry').on(table.entryId)],
);
