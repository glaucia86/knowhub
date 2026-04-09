import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { Module, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { asc, eq } from 'drizzle-orm';
import request from 'supertest';
import { closeDatabaseClient, getDatabaseClient } from '../../db/database.client';
import { LOCAL_MIGRATIONS_PATH } from '../../db';
import {
  connectionEdges,
  contentChunks,
  knowledgeEntries,
  maintenanceJobs,
  users,
} from '../../db/schema';
import { KnowledgeModule } from './knowledge.module';

@Module({
  imports: [KnowledgeModule],
})
class KnowledgeIntegrationTestModule {}

function applyMigrations(): void {
  const client = getDatabaseClient();
  client.sqlite.pragma('foreign_keys = ON');

  const migrationFiles = readdirSync(LOCAL_MIGRATIONS_PATH)
    .filter((entry) => entry.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right));

  for (const migrationFile of migrationFiles) {
    const migrationSql = readFileSync(
      path.join(LOCAL_MIGRATIONS_PATH, migrationFile),
      'utf8',
    ).trim();
    if (migrationSql.length > 0) {
      client.sqlite.exec(migrationSql);
    }
  }
}

export interface KnowledgeTestContext {
  request: ReturnType<typeof request>;
  cleanup: () => Promise<void>;
  insertUser: (userId: string) => Promise<void>;
  insertEntry: (values: typeof knowledgeEntries.$inferInsert) => Promise<void>;
  insertChunk: (entryId: string, content?: string) => Promise<void>;
  insertConnection: (sourceId: string, targetId: string) => Promise<void>;
  findMaintenanceJobs: (entryId: string) => Promise<Array<typeof maintenanceJobs.$inferSelect>>;
}

export async function createKnowledgeTestContext(userId = 'user-1'): Promise<KnowledgeTestContext> {
  const previousDatabaseUrl = process.env.DATABASE_URL;

  closeDatabaseClient();
  process.env.DATABASE_URL = ':memory:';
  applyMigrations();

  const app = await NestFactory.create(KnowledgeIntegrationTestModule, { logger: false });
  let chunkIndex = 0;
  app.use((httpRequest: { user?: { sub: string } }, _response: unknown, next: () => void) => {
    httpRequest.user = { sub: userId };
    next();
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.init();

  const client = getDatabaseClient();
  await client.db
    .insert(users)
    .values({
      id: userId,
      name: userId,
      email: `${userId}@example.com`,
    })
    .onConflictDoNothing();

  return {
    request: request(app.getHttpServer()),
    cleanup: async () => {
      await app.close();
      closeDatabaseClient();
      if (previousDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = previousDatabaseUrl;
      }
    },
    insertUser: async (newUserId: string) => {
      await client.db
        .insert(users)
        .values({
          id: newUserId,
          name: newUserId,
          email: `${newUserId}@example.com`,
        })
        .onConflictDoNothing();
    },
    insertEntry: async (values) => {
      await client.db.insert(knowledgeEntries).values(values);
    },
    insertChunk: async (entryId: string, content = 'chunk content') => {
      chunkIndex += 1;
      await client.db.insert(contentChunks).values({
        id: `${entryId}-chunk-${chunkIndex}`,
        entryId,
        chunkIndex: chunkIndex - 1,
        content,
        tokenCount: 10,
      });
    },
    insertConnection: async (sourceId: string, targetId: string) => {
      await client.db.insert(connectionEdges).values({
        id: `${sourceId}-${targetId}-edge`,
        sourceId,
        targetId,
        similarity: 0.8,
        type: 'related',
        createdAt: new Date(),
      });
    },
    findMaintenanceJobs: async (entryId: string) => {
      return client.db
        .select()
        .from(maintenanceJobs)
        .where(eq(maintenanceJobs.entryId, entryId))
        .orderBy(asc(maintenanceJobs.createdAt));
    },
  };
}

export function assertDataEnvelope<T extends { data: unknown }>(
  payload: T | undefined,
): asserts payload is T {
  assert.ok(payload);
  assert.ok('data' in payload);
}
