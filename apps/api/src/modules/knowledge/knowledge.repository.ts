import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, ne, or, sql, type SQL } from 'drizzle-orm';
import type {
  AIProvider,
  EntryMetadata,
  KnowledgeEntryStatus,
  KnowledgeEntryType,
  MaintenanceJobStatus,
} from '@knowhub/shared-types';
import { buildFtsMatchQuery, normalizeSearchText } from '@knowhub/shared-utils';
import { getDatabaseClient } from '../../db/database.client';
import {
  connectionEdges,
  contentChunks,
  userSettings,
  entryTags,
  knowledgeEntries,
  maintenanceJobs,
  tags,
} from '../../db/schema';
import { normalizeTagName } from './knowledge.helpers';

export interface KnowledgeEntryRecord {
  id: string;
  userId: string;
  type: KnowledgeEntryType;
  title: string;
  content: string | null;
  sourceUrl: string | null;
  filePath: string | null;
  metadata: EntryMetadata | null;
  summary: string | null;
  lastError?: string | null;
  status: KnowledgeEntryStatus;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date | null;
  archivedAt: Date | null;
  tags: string[];
}

export interface KnowledgeEntryDetailRecord extends KnowledgeEntryRecord {
  relatedConnectionCount: number;
  contentChunkCount: number;
}

export interface CreateKnowledgeEntryRecord {
  id: string;
  userId: string;
  type: KnowledgeEntryType;
  title: string;
  content?: string;
  sourceUrl?: string;
  filePath?: string;
  metadata?: EntryMetadata;
  summary?: string;
  status: KnowledgeEntryStatus;
}

export interface UpdateKnowledgeEntryRecord {
  title?: string;
  content?: string | null;
  sourceUrl?: string | null;
  filePath?: string | null;
  metadata?: EntryMetadata | null;
  summary?: string | null;
  lastError?: string | null;
  status?: KnowledgeEntryStatus;
  archivedAt?: Date | null;
}

export interface ContentChunkRecord {
  id: string;
  entryId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding?: number[] | null;
  embeddingModel?: string | null;
}

export interface CreateMaintenanceJobInput {
  type: string;
  status: MaintenanceJobStatus;
  userId?: string;
  entryId?: string;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown> | null;
}

export interface KnowledgeListFilters {
  page: number;
  limit: number;
  type?: KnowledgeEntryType;
  status?: KnowledgeEntryStatus;
  tag?: string;
  q?: string;
}

@Injectable()
export class KnowledgeRepository {
  private readonly db = getDatabaseClient().db;

  private async loadTagsByEntryIds(entryIds: string[]): Promise<Map<string, string[]>> {
    const result = new Map<string, string[]>();
    if (entryIds.length === 0) {
      return result;
    }

    const rows = await this.db
      .select({
        entryId: entryTags.entryId,
        tagName: tags.name,
      })
      .from(entryTags)
      .innerJoin(tags, eq(entryTags.tagId, tags.id))
      .where(inArray(entryTags.entryId, entryIds));

    for (const row of rows) {
      const values = result.get(row.entryId) ?? [];
      values.push(row.tagName);
      result.set(row.entryId, values);
    }

    for (const values of result.values()) {
      values.sort((left, right) => left.localeCompare(right));
    }

    return result;
  }

  private mapEntry(
    row: typeof knowledgeEntries.$inferSelect,
    tagMap: Map<string, string[]>,
  ): KnowledgeEntryRecord {
    return {
      id: row.id,
      userId: row.userId,
      type: row.type as KnowledgeEntryType,
      title: row.title,
      content: row.content,
      sourceUrl: row.sourceUrl,
      filePath: row.filePath,
      metadata: row.metadata as EntryMetadata | null,
      summary: row.summary,
      lastError: row.lastError,
      status: row.status as KnowledgeEntryStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      accessedAt: row.accessedAt,
      archivedAt: row.archivedAt,
      tags: tagMap.get(row.id) ?? [],
    };
  }

  async createEntry(entry: CreateKnowledgeEntryRecord): Promise<void> {
    const now = new Date();
    await this.db.insert(knowledgeEntries).values({
      id: entry.id,
      userId: entry.userId,
      type: entry.type,
      title: entry.title,
      content: entry.content ?? null,
      sourceUrl: entry.sourceUrl ?? null,
      filePath: entry.filePath ?? null,
      metadata: entry.metadata ?? null,
      summary: entry.summary ?? null,
      lastError: null,
      status: entry.status,
      createdAt: now,
      updatedAt: now,
    });
  }

  async listEntriesForUser(
    userId: string,
    filters: KnowledgeListFilters,
  ): Promise<{ data: KnowledgeEntryRecord[]; total: number }> {
    const whereClauses: SQL[] = [eq(knowledgeEntries.userId, userId)];
    if (filters.type) {
      whereClauses.push(eq(knowledgeEntries.type, filters.type));
    }
    if (filters.status) {
      whereClauses.push(eq(knowledgeEntries.status, filters.status));
    } else {
      whereClauses.push(ne(knowledgeEntries.status, 'ARCHIVED'));
    }

    const normalizedQuery = normalizeSearchText(filters.q);
    const normalizedTag = filters.tag ? normalizeTagName(filters.tag) : undefined;
    if (normalizedTag) {
      whereClauses.push(sql`
        exists (
          select 1
          from ${entryTags}
          inner join ${tags} on ${tags.id} = ${entryTags.tagId}
          where ${entryTags.entryId} = ${knowledgeEntries.id}
            and ${tags.userId} = ${userId}
            and normalize_search(${tags.name}) = ${normalizedTag}
        )
      `);
    }
    if (normalizedQuery) {
      whereClauses.push(sql`
        exists (
          select 1
          from knowledge_title_fts fts
          where fts.entry_id = ${knowledgeEntries.id}
            and fts.user_id = ${userId}
            and knowledge_title_fts match ${buildFtsMatchQuery(normalizedQuery) ?? normalizedQuery}
        )
      `);
    }

    const offset = (filters.page - 1) * filters.limit;
    const rows = await this.db
      .select()
      .from(knowledgeEntries)
      .where(and(...whereClauses))
      .orderBy(desc(knowledgeEntries.createdAt), desc(knowledgeEntries.id))
      .limit(filters.limit)
      .offset(offset);
    const tagMap = await this.loadTagsByEntryIds(rows.map((row) => row.id));
    const totalRows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(knowledgeEntries)
      .where(and(...whereClauses));

    return {
      data: rows.map((row) => this.mapEntry(row, tagMap)),
      total: Number(totalRows[0]?.count ?? 0),
    };
  }

  async getEntryByIdForUser(userId: string, entryId: string): Promise<KnowledgeEntryRecord | null> {
    const rows = await this.db
      .select()
      .from(knowledgeEntries)
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)))
      .limit(1);
    if (rows.length === 0) {
      return null;
    }

    const tagMap = await this.loadTagsByEntryIds([entryId]);
    return this.mapEntry(rows[0], tagMap);
  }

  async getEntryByIdInternal(entryId: string): Promise<KnowledgeEntryRecord | null> {
    const rows = await this.db
      .select()
      .from(knowledgeEntries)
      .where(eq(knowledgeEntries.id, entryId))
      .limit(1);
    if (rows.length === 0) {
      return null;
    }
    const tagMap = await this.loadTagsByEntryIds([entryId]);
    return this.mapEntry(rows[0], tagMap);
  }

  async findMostRecentBySourceUrlForUser(
    userId: string,
    sourceUrl: string,
  ): Promise<KnowledgeEntryRecord | null> {
    const rows = await this.db
      .select()
      .from(knowledgeEntries)
      .where(and(eq(knowledgeEntries.userId, userId), eq(knowledgeEntries.sourceUrl, sourceUrl)))
      .orderBy(desc(knowledgeEntries.createdAt), desc(knowledgeEntries.id))
      .limit(1);
    if (rows.length === 0) {
      return null;
    }

    const tagMap = await this.loadTagsByEntryIds([rows[0].id]);
    return this.mapEntry(rows[0], tagMap);
  }

  async getEntryDetailForUser(
    userId: string,
    entryId: string,
  ): Promise<KnowledgeEntryDetailRecord | null> {
    const entry = await this.getEntryByIdForUser(userId, entryId);
    if (!entry) {
      return null;
    }

    const chunkRows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(contentChunks)
      .where(eq(contentChunks.entryId, entryId));
    const connectionRows = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(connectionEdges)
      .where(or(eq(connectionEdges.sourceId, entryId), eq(connectionEdges.targetId, entryId)));

    return {
      ...entry,
      contentChunkCount: Number(chunkRows[0]?.count ?? 0),
      relatedConnectionCount: Number(connectionRows[0]?.count ?? 0),
    };
  }

  async updateEntry(
    userId: string,
    entryId: string,
    updates: UpdateKnowledgeEntryRecord,
  ): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        title: updates.title,
        content: updates.content,
        sourceUrl: updates.sourceUrl,
        filePath: updates.filePath,
        metadata: updates.metadata,
        summary: updates.summary,
        lastError: updates.lastError,
        status: updates.status,
        archivedAt: updates.archivedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async markAccessed(userId: string, entryId: string): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({ accessedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async archiveEntry(userId: string, entryId: string): Promise<void> {
    const now = new Date();
    await this.db
      .update(knowledgeEntries)
      .set({ status: 'ARCHIVED', archivedAt: now, updatedAt: now })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async restoreEntry(userId: string, entryId: string, status: KnowledgeEntryStatus): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        status,
        archivedAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async markPending(userId: string, entryId: string): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        status: 'PENDING',
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async updateStatus(entryId: string, userId: string, status: KnowledgeEntryStatus): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async updateStatusWithError(
    entryId: string,
    userId: string,
    status: 'FAILED',
    lastError: string,
  ): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        status,
        lastError,
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async clearLastError(entryId: string, userId: string): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        lastError: null,
        updatedAt: new Date(),
      })
      .where(and(eq(knowledgeEntries.id, entryId), eq(knowledgeEntries.userId, userId)));
  }

  async updateSummary(entryId: string, summary: string | null): Promise<void> {
    await this.db
      .update(knowledgeEntries)
      .set({
        summary,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeEntries.id, entryId));
  }

  async deleteChunksByEntryId(entryId: string): Promise<void> {
    await this.db.delete(contentChunks).where(eq(contentChunks.entryId, entryId));
  }

  async insertChunksBatch(chunks: ContentChunkRecord[]): Promise<void> {
    if (chunks.length === 0) {
      return;
    }

    await this.db
      .insert(contentChunks)
      .values(
        chunks.map((chunk) => ({
          id: chunk.id,
          entryId: chunk.entryId,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
          embeddingModel: chunk.embeddingModel ?? null,
        })),
      )
      .onConflictDoUpdate({
        target: [contentChunks.entryId, contentChunks.chunkIndex],
        set: {
          content: sql`excluded.content`,
          tokenCount: sql`excluded.token_count`,
          embedding: sql`excluded.embedding`,
          embeddingModel: sql`excluded.embedding_model`,
        },
      });
  }

  async getUserSettingsForIndexing(userId: string): Promise<{
    language: string;
    aiProvider: AIProvider;
    aiModel: string;
    privacyMode: boolean;
  }> {
    const rows = await this.db
      .select({
        language: userSettings.language,
        aiProvider: userSettings.aiProvider,
        aiModel: userSettings.aiModel,
        privacyMode: userSettings.privacyMode,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    const fallback = {
      language: 'pt-BR',
      aiProvider: 'ollama' as const,
      aiModel: 'llama3.1',
      privacyMode: true,
    };
    if (rows.length === 0) {
      return fallback;
    }
    return {
      language: rows[0].language,
      aiProvider: rows[0].aiProvider as AIProvider,
      aiModel: rows[0].aiModel,
      privacyMode: rows[0].privacyMode,
    };
  }

  async getPendingEntriesForDrain(): Promise<Array<{ entryId: string; userId: string }>> {
    const rows = await this.db
      .select({
        entryId: knowledgeEntries.id,
        userId: knowledgeEntries.userId,
      })
      .from(knowledgeEntries)
      .where(
        and(eq(knowledgeEntries.status, 'PENDING'), sql`${knowledgeEntries.content} IS NOT NULL`),
      )
      .orderBy(desc(knowledgeEntries.updatedAt))
      .limit(500);

    return rows;
  }

  async createMaintenanceJob(input: CreateMaintenanceJobInput): Promise<string> {
    const jobId = randomUUID();
    await this.db.insert(maintenanceJobs).values({
      id: jobId,
      type: input.type,
      status: input.status,
      userId: input.userId ?? null,
      entryId: input.entryId ?? null,
      payload: input.payload ? JSON.stringify(input.payload) : null,
      result: input.result ? JSON.stringify(input.result) : null,
      createdAt: new Date(),
      completedAt: null,
    });
    return jobId;
  }
}
