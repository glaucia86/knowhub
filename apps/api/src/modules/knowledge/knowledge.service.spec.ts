import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { KnowledgeEntryRecord } from './knowledge.repository';
import { KnowledgeService } from './knowledge.service';

function buildEntry(overrides: Partial<KnowledgeEntryRecord> = {}): KnowledgeEntryRecord {
  return {
    id: 'entry-1',
    userId: 'user-1',
    type: 'NOTE',
    title: 'Existing title',
    content: 'Existing content',
    sourceUrl: null,
    filePath: null,
    summary: null,
    status: 'INDEXED',
    createdAt: new Date('2026-03-08T00:00:00.000Z'),
    updatedAt: new Date('2026-03-08T00:00:00.000Z'),
    accessedAt: null,
    archivedAt: null,
    tags: [],
    ...overrides,
  };
}

function createService(
  repository: object,
  options: {
    tagsService?: object;
    eventEmitter?: EventEmitter2;
    outbox?: object;
  } = {},
) {
  return new KnowledgeService(
    repository as never,
    (options.tagsService ?? { syncEntryTags: async () => {} }) as never,
    (options.eventEmitter ?? {
      listenerCount: () => 0,
      emit: () => false,
    }) as unknown as EventEmitter2,
    (options.outbox ?? {
      enqueueEvent: async () => 'job-1',
      enqueueReindex: async () => 'job-1',
    }) as never,
    {
      generate: (input: {
        type: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
        title?: string;
        content?: string;
        sourceUrl?: string;
        filePath?: string;
      }) => {
        if (input.title) {
          return input.title;
        }
        if (input.type === 'NOTE' && input.content) {
          return input.content.split(/\r?\n/u)[0]?.trim().slice(0, 80) ?? null;
        }
        if (input.type === 'LINK' && input.sourceUrl) {
          return new URL(input.sourceUrl).hostname;
        }
        if (input.type === 'GITHUB' && input.sourceUrl) {
          const url = new URL(input.sourceUrl);
          const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/');
          return owner && repo ? `GitHub: ${owner}/${repo}` : `GitHub: ${url.hostname}`;
        }
        if (input.type === 'PDF' && input.filePath) {
          return input.filePath.split(/[\\/]/u).at(-1) ?? input.filePath;
        }
        return input.content?.slice(0, 80) ?? null;
      },
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

describe('KnowledgeService create rules', () => {
  it('generates a title from note content', async () => {
    let storedEntry: KnowledgeEntryRecord | null = null;
    let queuedType: string | undefined;
    const repository = {
      async createEntry(entry: {
        id: string;
        userId: string;
        type: 'NOTE';
        title: string;
        content?: string;
        status: 'PENDING';
      }) {
        storedEntry = buildEntry({
          id: entry.id,
          userId: entry.userId,
          type: entry.type,
          title: entry.title,
          content: entry.content ?? null,
          status: entry.status,
        });
      },
      async getEntryByIdForUser() {
        return storedEntry;
      },
    };
    const service = createService(repository, {
      outbox: {
        enqueueEvent: async (input: { type?: string }) => {
          queuedType = input.type;
          return 'job-1';
        },
        enqueueReindex: async () => 'job-2',
      },
    });

    const result = await service.createEntry('user-1', {
      type: 'NOTE',
      content: 'First line becomes title\nSecond line stays in content',
    });

    assert.equal(result.data.title, 'First line becomes title');
    assert.equal(result.data.status, 'PENDING');
    assert.equal(queuedType, 'NOTE');
  });

  it('rejects github entries outside github.com', async () => {
    const repository = {
      async createEntry() {},
      async getEntryByIdForUser() {
        return buildEntry();
      },
    };
    const service = createService(repository);

    await assert.rejects(
      service.createEntry('user-1', {
        type: 'GITHUB',
        sourceUrl: 'https://example.com/org/repo',
      }),
      /github\.com/,
    );
  });

  it('rejects unsafe file paths for pdf entries', async () => {
    const repository = {
      async createEntry() {},
      async getEntryByIdForUser() {
        return buildEntry();
      },
    };
    const service = createService(repository);

    await assert.rejects(
      service.createEntry('user-1', {
        type: 'PDF',
        filePath: '../secrets.pdf',
      }),
      /safe relative path/,
    );
  });

  it('includes contentSizeBytes in the response contract', async () => {
    let storedEntry: KnowledgeEntryRecord | null = null;
    const repository = {
      async createEntry(entry: {
        id: string;
        userId: string;
        type: 'NOTE';
        title: string;
        content?: string;
        status: 'PENDING';
      }) {
        storedEntry = buildEntry({
          id: entry.id,
          userId: entry.userId,
          type: entry.type,
          title: entry.title,
          content: entry.content ?? null,
          status: entry.status,
        });
      },
      async getEntryByIdForUser() {
        return storedEntry;
      },
    };
    const service = createService(repository);

    const result = await service.createEntry('user-1', {
      type: 'NOTE',
      content: 'abc',
    });

    assert.equal(result.data.contentSizeBytes, 3);
  });

  it('generates hostname title for links and GitHub owner/repo title for github entries', async () => {
    const storedEntries = new Map<string, KnowledgeEntryRecord>();
    const repository = {
      async createEntry(entry: {
        id: string;
        userId: string;
        type: 'LINK' | 'GITHUB';
        title: string;
        sourceUrl?: string;
        status: 'PENDING';
      }) {
        storedEntries.set(
          entry.id,
          buildEntry({
            id: entry.id,
            userId: entry.userId,
            type: entry.type,
            title: entry.title,
            sourceUrl: entry.sourceUrl ?? null,
            content: null,
            status: entry.status,
          }),
        );
      },
      async getEntryByIdForUser(_userId: string, entryId: string) {
        return storedEntries.get(entryId) ?? null;
      },
    };
    const service = createService(repository);

    const linkResult = await service.createEntry('user-1', {
      type: 'LINK',
      sourceUrl: 'https://docs.nestjs.com/controllers',
    });
    const githubResult = await service.createEntry('user-1', {
      type: 'GITHUB',
      sourceUrl: 'https://github.com/openai/openai-node',
    });

    assert.equal(linkResult.data.title, 'docs.nestjs.com');
    assert.equal(githubResult.data.title, 'GitHub: openai/openai-node');
  });

  it('preserves explicit title and supports pdf filename fallback', async () => {
    const storedEntries = new Map<string, KnowledgeEntryRecord>();
    const repository = {
      async createEntry(entry: {
        id: string;
        userId: string;
        type: 'PDF' | 'NOTE';
        title: string;
        filePath?: string;
        content?: string;
        status: 'PENDING';
      }) {
        storedEntries.set(
          entry.id,
          buildEntry({
            id: entry.id,
            userId: entry.userId,
            type: entry.type,
            title: entry.title,
            filePath: entry.filePath ?? null,
            content: entry.content ?? null,
            status: entry.status,
          }),
        );
      },
      async getEntryByIdForUser(_userId: string, entryId: string) {
        return storedEntries.get(entryId) ?? null;
      },
    };
    const service = createService(repository);

    const titled = await service.createEntry('user-1', {
      type: 'NOTE',
      title: 'Manual title',
      content: 'ignored for title',
    });
    const pdf = await service.createEntry('user-1', {
      type: 'PDF',
      filePath: 'docs/manual.pdf',
    });

    assert.equal(titled.data.title, 'Manual title');
    assert.equal(pdf.data.title, 'manual.pdf');
  });

  it('returns paginated list metadata from the repository', async () => {
    const repository = {
      async listEntriesForUser() {
        return {
          data: [buildEntry({ id: 'entry-9', title: 'Result title', content: 'large content' })],
          total: 3,
        };
      },
    };
    const service = createService(repository);

    const result = await service.listEntries('user-1', { page: 2, limit: 2 });

    assert.equal(result.meta.page, 2);
    assert.equal(result.meta.total, 3);
    assert.equal(result.data[0]?.title, 'Result title');
    assert.equal(result.data[0]?.content, undefined);
  });

  it('returns entry detail and updates accessedAt', async () => {
    let markedAccessed = false;
    const repository = {
      async markAccessed() {
        markedAccessed = true;
      },
      async getEntryDetailForUser() {
        return {
          ...buildEntry(),
          contentChunkCount: 4,
          relatedConnectionCount: 1,
        };
      },
    };
    const service = createService(repository);

    const result = await service.getEntry('user-1', 'entry-1');

    assert.equal(markedAccessed, true);
    assert.equal(result.data.contentChunkCount, 4);
    assert.equal(result.data.relatedConnectionCount, 1);
  });

  it('throws when detail lookup does not find an entry', async () => {
    const repository = {
      async markAccessed() {},
      async getEntryDetailForUser() {
        return null;
      },
    };
    const service = createService(repository);

    await assert.rejects(service.getEntry('user-1', 'missing'), /not found/);
  });

  it('updates only metadata without forcing pending status', async () => {
    let persistedStatus: string | undefined;
    const repository = {
      async getEntryByIdForUser() {
        return buildEntry({ status: 'INDEXED' });
      },
      async updateEntry(_userId: string, _entryId: string, updates: { status?: string }) {
        persistedStatus = updates.status;
      },
    };
    const service = createService(repository, {
      tagsService: { syncEntryTags: async () => {} },
    });

    const result = await service.updateEntry('user-1', 'entry-1', { title: 'Retitled' });

    assert.equal(persistedStatus, 'INDEXED');
    assert.equal(result.data.status, 'INDEXED');
  });

  it('syncs tags when tags are explicitly provided on update', async () => {
    let syncedTags: string[] | undefined;
    const repository = {
      async getEntryByIdForUser() {
        return buildEntry({ status: 'INDEXED' });
      },
      async updateEntry() {},
    };
    const service = createService(repository, {
      tagsService: {
        syncEntryTags: async (_userId: string, _entryId: string, tags: string[]) => {
          syncedTags = tags;
        },
      },
    });

    await service.updateEntry('user-1', 'entry-1', { tags: ['TypeScript'] });

    assert.deepEqual(syncedTags, ['typescript']);
  });

  it('marks content updates as pending and emits content-updated flow', async () => {
    let persistedStatus: string | undefined;
    let persistedSummary: string | null | undefined;
    let queuedEvent: string | undefined;
    let fetchCount = 0;
    const repository = {
      async getEntryByIdForUser(_userId: string, _entryId: string) {
        fetchCount += 1;
        return buildEntry({
          type: 'LINK',
          sourceUrl: 'https://docs.nestjs.com',
          content: null,
          summary: fetchCount > 1 ? null : 'Old summary',
          status: fetchCount > 1 ? 'PENDING' : 'INDEXED',
        });
      },
      async updateEntry(
        _userId: string,
        _entryId: string,
        updates: { status?: string; summary?: string | null },
      ) {
        persistedStatus = updates.status;
        persistedSummary = updates.summary;
      },
    };
    const service = createService(repository, {
      outbox: {
        enqueueEvent: async (input: { eventName: string }) => {
          queuedEvent = input.eventName;
          return 'job-22';
        },
        enqueueReindex: async () => 'job-23',
      },
    });

    const result = await service.updateEntry('user-1', 'entry-1', {
      sourceUrl: 'https://docs.nestjs.com/controllers',
    });

    assert.equal(persistedStatus, 'PENDING');
    assert.equal(persistedSummary, null);
    assert.equal(queuedEvent, 'entry.updated.content');
    assert.equal(result.data.status, 'PENDING');
  });

  it('archives entries idempotently', async () => {
    let archiveCalls = 0;
    const repository = {
      async getEntryByIdForUser() {
        return buildEntry({ status: 'ARCHIVED', archivedAt: new Date('2026-03-08T00:10:00.000Z') });
      },
      async archiveEntry() {
        archiveCalls += 1;
      },
    };
    const service = createService(repository);

    await service.archiveEntry('user-1', 'entry-1');

    assert.equal(archiveCalls, 0);
  });

  it('archives active entries when they are not yet archived', async () => {
    let archiveCalls = 0;
    const repository = {
      async getEntryByIdForUser() {
        return buildEntry({ status: 'INDEXED' });
      },
      async archiveEntry() {
        archiveCalls += 1;
      },
    };
    const service = createService(repository);

    await service.archiveEntry('user-1', 'entry-1');

    assert.equal(archiveCalls, 1);
  });

  it('throws when archive target is not found', async () => {
    const repository = {
      async getEntryByIdForUser() {
        return null;
      },
    };
    const service = createService(repository);

    await assert.rejects(service.archiveEntry('user-1', 'missing'), /not found/);
  });

  it('rejects manual reindex for archived entries with 422 semantics', async () => {
    const repository = {
      async getEntryByIdForUser() {
        return buildEntry({ status: 'ARCHIVED', archivedAt: new Date('2026-03-08T00:10:00.000Z') });
      },
    };
    const service = createService(repository);

    await assert.rejects(service.reindexEntry('user-1', 'entry-1'), /cannot be reindexed/);
  });

  it('rejects manual reindex when the entry is already pending or indexing', async () => {
    const pendingService = createService({
      async getEntryByIdForUser() {
        return buildEntry({ status: 'PENDING' });
      },
    });
    const indexingService = createService({
      async getEntryByIdForUser() {
        return buildEntry({ status: 'INDEXING' });
      },
    });

    await assert.rejects(
      pendingService.reindexEntry('user-1', 'entry-1'),
      /already queued or indexing/,
    );
    await assert.rejects(
      indexingService.reindexEntry('user-1', 'entry-1'),
      /already queued or indexing/,
    );
  });

  it('throws for invalid payload shapes across entry types', async () => {
    const repository = {
      async createEntry() {},
      async getEntryByIdForUser() {
        return buildEntry();
      },
    };
    const service = createService(repository);

    await assert.rejects(
      service.createEntry('user-1', { type: 'NOTE' }),
      /NOTE entries require content/,
    );
    await assert.rejects(
      service.createEntry('user-1', { type: 'LINK' }),
      /LINK entries require sourceUrl/,
    );
    await assert.rejects(
      service.createEntry('user-1', { type: 'PDF' }),
      /PDF entries require filePath or content/,
    );
    await assert.rejects(
      service.createEntry('user-1', { type: 'GITHUB' }),
      /GITHUB entries require sourceUrl/,
    );
  });

  it('throws when created entry cannot be reloaded after insert', async () => {
    const repository = {
      async createEntry() {},
      async getEntryByIdForUser() {
        return null;
      },
    };
    const service = createService(repository);

    await assert.rejects(
      service.createEntry('user-1', { type: 'NOTE', content: 'hello' }),
      /not found/,
    );
  });

  it('emits directly when listeners are registered', async () => {
    let emitCalls = 0;
    let emittedEvent: unknown;
    const storedEntries = new Map<string, KnowledgeEntryRecord>();
    const repository = {
      async createEntry(entry: {
        id: string;
        userId: string;
        type: 'NOTE';
        title: string;
        content?: string;
        status: 'PENDING';
      }) {
        storedEntries.set(
          entry.id,
          buildEntry({
            id: entry.id,
            userId: entry.userId,
            type: entry.type,
            title: entry.title,
            content: entry.content ?? null,
            status: entry.status,
          }),
        );
      },
      async getEntryByIdForUser(_userId: string, entryId: string) {
        return storedEntries.get(entryId) ?? null;
      },
    };
    const service = createService(repository, {
      eventEmitter: {
        listenerCount: () => 1,
        emit: (_eventName: string, payload: unknown) => {
          emitCalls += 1;
          emittedEvent = payload;
          return true;
        },
      } as unknown as EventEmitter2,
      outbox: {
        enqueueEvent: async () => {
          throw new Error('should not enqueue');
        },
        enqueueReindex: async () => 'job-1',
      },
    });

    await service.createEntry('user-1', { type: 'NOTE', content: 'hello world' });

    assert.equal(emitCalls, 1);
    assert.equal((emittedEvent as { userId: string }).userId, 'user-1');
    assert.equal((emittedEvent as { type: string }).type, 'NOTE');
    assert.ok((emittedEvent as { entryId?: string }).entryId);
  });
});
