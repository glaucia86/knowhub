import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { KnowledgeService } from './knowledge.service';

function createService(repository: object, outbox: object = {}) {
  return new KnowledgeService(
    repository as never,
    { syncEntryTags: async () => {} } as never,
    { listenerCount: () => 0, emit: () => false } as unknown as EventEmitter2,
    {
      enqueueEvent: async () => 'job-outbox',
      enqueueReindex: async () => 'job-reindex',
      ...outbox,
    } as never,
    {
      generate: (input: { title?: string; content?: string }) =>
        input.title ?? input.content?.slice(0, 80) ?? null,
    } as never,
    {
      paginate: (page: number, limit: number, total: number) => ({
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      }),
    } as never,
  );
}

describe('KnowledgeService lifecycle transitions', () => {
  it('restores archived entries to INDEXED when content chunks still exist', async () => {
    let restoredStatus: string | null = null;
    let fetchCount = 0;
    const repository = {
      async getEntryByIdForUser() {
        fetchCount += 1;
        if (fetchCount === 1) {
          return {
            id: 'entry-1',
            userId: 'user-1',
            type: 'NOTE',
            title: 'Archived entry',
            content: 'content',
            sourceUrl: null,
            filePath: null,
            summary: null,
            status: 'ARCHIVED',
            createdAt: new Date('2026-03-08T00:00:00.000Z'),
            updatedAt: new Date('2026-03-08T00:00:00.000Z'),
            accessedAt: null,
            archivedAt: new Date('2026-03-08T00:05:00.000Z'),
            tags: [],
          };
        }

        return {
          id: 'entry-1',
          userId: 'user-1',
          type: 'NOTE',
          title: 'Archived entry',
          content: 'content',
          sourceUrl: null,
          filePath: null,
          summary: null,
          status: 'INDEXED',
          createdAt: new Date('2026-03-08T00:00:00.000Z'),
          updatedAt: new Date('2026-03-08T00:01:00.000Z'),
          accessedAt: null,
          archivedAt: null,
          tags: [],
        };
      },
      async getEntryDetailForUser() {
        return {
          id: 'entry-1',
          userId: 'user-1',
          type: 'NOTE',
          title: 'Archived entry',
          content: 'content',
          sourceUrl: null,
          filePath: null,
          summary: null,
          status: 'ARCHIVED',
          createdAt: new Date('2026-03-08T00:00:00.000Z'),
          updatedAt: new Date('2026-03-08T00:00:00.000Z'),
          accessedAt: null,
          archivedAt: new Date('2026-03-08T00:05:00.000Z'),
          tags: [],
          contentChunkCount: 2,
          relatedConnectionCount: 0,
        };
      },
      async updateEntry(_userId: string, _entryId: string, updates: { status?: string }) {
        restoredStatus = updates.status ?? null;
      },
    };
    const service = createService(repository);

    const response = await service.updateEntry('user-1', 'entry-1', {});

    assert.equal(restoredStatus, 'INDEXED');
    assert.equal(response.data.status, 'INDEXED');
  });

  it('queues restore via outbox when chunks no longer exist', async () => {
    let restoreAction: string | undefined;
    let restoredSummary: string | null | undefined;
    let fetchCount = 0;
    const repository = {
      async getEntryByIdForUser() {
        fetchCount += 1;
        if (fetchCount === 1) {
          return {
            id: 'entry-1',
            userId: 'user-1',
            type: 'NOTE',
            title: 'Archived entry',
            content: 'content',
            sourceUrl: null,
            filePath: null,
            summary: null,
            status: 'ARCHIVED',
            createdAt: new Date('2026-03-08T00:00:00.000Z'),
            updatedAt: new Date('2026-03-08T00:00:00.000Z'),
            accessedAt: null,
            archivedAt: new Date('2026-03-08T00:05:00.000Z'),
            tags: [],
          };
        }

        return {
          id: 'entry-1',
          userId: 'user-1',
          type: 'NOTE',
          title: 'Archived entry',
          content: 'content',
          sourceUrl: null,
          filePath: null,
          summary: null,
          status: 'PENDING',
          createdAt: new Date('2026-03-08T00:00:00.000Z'),
          updatedAt: new Date('2026-03-08T00:01:00.000Z'),
          accessedAt: null,
          archivedAt: null,
          tags: [],
        };
      },
      async getEntryDetailForUser() {
        return {
          id: 'entry-1',
          userId: 'user-1',
          type: 'NOTE',
          title: 'Archived entry',
          content: 'content',
          sourceUrl: null,
          filePath: null,
          summary: null,
          status: 'ARCHIVED',
          createdAt: new Date('2026-03-08T00:00:00.000Z'),
          updatedAt: new Date('2026-03-08T00:00:00.000Z'),
          accessedAt: null,
          archivedAt: new Date('2026-03-08T00:05:00.000Z'),
          tags: [],
          contentChunkCount: 0,
          relatedConnectionCount: 0,
        };
      },
      async updateEntry(
        _userId: string,
        _entryId: string,
        updates: { status?: string; summary?: string | null },
      ) {
        assert.equal(updates.status, 'PENDING');
        restoredSummary = updates.summary;
      },
    };
    const service = createService(repository, {
      enqueueEvent: async (input: { eventName: string }) => {
        restoreAction = input.eventName;
        return 'job-2';
      },
    });

    const response = await service.updateEntry('user-1', 'entry-1', {});

    assert.equal(restoreAction, 'entry.created');
    assert.equal(restoredSummary, null);
    assert.equal(response.data.status, 'PENDING');
  });

  it('creates an observable stub for manual reindex', async () => {
    let markedPending = false;
    let reindexEntryId: string | null = null;
    let clearedSummary: string | null | undefined;
    const repository = {
      async getEntryByIdForUser() {
        return {
          id: 'entry-5',
          userId: 'user-1',
          type: 'LINK',
          title: 'Docs',
          content: null,
          sourceUrl: 'https://docs.nestjs.com',
          filePath: null,
          summary: null,
          status: 'INDEXED',
          createdAt: new Date('2026-03-08T00:00:00.000Z'),
          updatedAt: new Date('2026-03-08T00:00:00.000Z'),
          accessedAt: null,
          archivedAt: null,
          tags: [],
        };
      },
      async updateEntry(
        _userId: string,
        entryId: string,
        updates: { status?: string; summary?: string | null },
      ) {
        markedPending = true;
        reindexEntryId = entryId;
        clearedSummary = updates.summary;
        assert.equal(updates.status, 'PENDING');
      },
    };
    const service = createService(repository, {
      enqueueReindex: async () => 'job-77',
    });

    const response = await service.reindexEntry('user-1', 'entry-5');

    assert.equal(markedPending, true);
    assert.equal(reindexEntryId, 'entry-5');
    assert.equal(clearedSummary, null);
    assert.equal(response.jobId, 'indexing-entry-5');
    assert.equal(response.status, 'QUEUED');
  });

  it('rejects updates while an entry is indexing', async () => {
    const repository = {
      async getEntryByIdForUser() {
        return {
          id: 'entry-8',
          userId: 'user-1',
          type: 'NOTE',
          title: 'Busy entry',
          content: 'content',
          sourceUrl: null,
          filePath: null,
          summary: null,
          status: 'INDEXING',
          createdAt: new Date('2026-03-08T00:00:00.000Z'),
          updatedAt: new Date('2026-03-08T00:00:00.000Z'),
          accessedAt: null,
          archivedAt: null,
          tags: [],
        };
      },
    };
    const service = createService(repository);

    await assert.rejects(
      service.updateEntry('user-1', 'entry-8', { title: 'new title' }),
      /indexing is in progress/,
    );
  });
});
