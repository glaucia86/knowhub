import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type {
  EntryMetadata,
  EntryCreatedEvent,
  EntryReindexRequestedEvent,
  EntryUpdatedContentEvent,
  KnowledgeEntryDetailEnvelopeResponse,
  KnowledgeEntryEnvelopeResponse,
  KnowledgeEntryListResponse,
  KnowledgeEntryReindexAcceptedResponse,
  KnowledgeEntryResponse,
} from '@knowhub/shared-types';
import type {
  CreateKnowledgeEntryDto,
  ListKnowledgeEntriesQueryDto,
  UpdateKnowledgeEntryDto,
} from './dto/knowledge.dto';
import {
  isSafeRelativeFilePath,
  normalizeTagList,
  toIsoDate,
  trimToUndefined,
} from './knowledge.helpers';
import { IndexingOutboxService } from './indexing-outbox.service';
import { KnowledgeRepository, type KnowledgeEntryRecord } from './knowledge.repository';
import { TagsService } from './tags.service';
import { KNOWLEDGE_EVENT_NAMES as KNOWLEDGE_EVENT_NAMES_CONST } from '@knowhub/shared-types';
import { PaginationHelper } from '../shared/pagination-helper.service';
import { TitleGeneratorService } from '../shared/title-generator.service';
import { buildIndexingJobId } from '../agents/indexing/indexing.queue';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly tagsService: TagsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly indexingOutboxService: IndexingOutboxService,
    private readonly titleGenerator: TitleGeneratorService,
    private readonly paginationHelper: PaginationHelper,
  ) {}

  private requireEntry(entry: KnowledgeEntryRecord | null): KnowledgeEntryRecord {
    if (!entry) {
      throw new NotFoundException('Knowledge entry not found');
    }
    return entry;
  }

  private ensureSafeFilePath(filePath: string | undefined): void {
    if (filePath && !isSafeRelativeFilePath(filePath)) {
      throw new BadRequestException(
        'filePath must be a safe relative path ending with .pdf, .txt, or .md',
      );
    }
  }

  private isAllowedGithubHostname(hostname: string): boolean {
    return hostname === 'github.com' || hostname.endsWith('.github.com');
  }

  private generateTitle(input: {
    type: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
    title?: string;
    content?: string;
    sourceUrl?: string;
    filePath?: string;
  }): string {
    const generatedTitle = this.titleGenerator.generate(input);
    if (generatedTitle) {
      return generatedTitle;
    }
    throw new UnprocessableEntityException('Unable to derive a title from the provided payload');
  }

  private validatePayload(input: {
    type: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
    content?: string;
    sourceUrl?: string;
    filePath?: string;
  }): void {
    this.ensureSafeFilePath(input.filePath);

    if (input.type === 'NOTE' && !input.content) {
      throw new UnprocessableEntityException('NOTE entries require content');
    }

    if (input.type === 'LINK' && !input.sourceUrl) {
      throw new UnprocessableEntityException('LINK entries require sourceUrl');
    }

    if (input.type === 'PDF' && !input.filePath && !input.content) {
      throw new UnprocessableEntityException('PDF entries require filePath or content');
    }

    if (input.type === 'GITHUB') {
      if (!input.sourceUrl) {
        throw new UnprocessableEntityException('GITHUB entries require sourceUrl');
      }

      const hostname = new URL(input.sourceUrl).hostname.toLowerCase();
      if (!this.isAllowedGithubHostname(hostname)) {
        throw new UnprocessableEntityException('GITHUB entries require a github.com sourceUrl');
      }
    }
  }

  private async emitOrEnqueueCreatedEvent(event: EntryCreatedEvent): Promise<void> {
    if (this.eventEmitter.listenerCount(KNOWLEDGE_EVENT_NAMES_CONST.entryCreated) > 0) {
      this.eventEmitter.emit(KNOWLEDGE_EVENT_NAMES_CONST.entryCreated, event);
      return;
    }

    await this.indexingOutboxService.enqueueEvent({
      eventName: KNOWLEDGE_EVENT_NAMES_CONST.entryCreated,
      entryId: event.entryId,
      userId: event.userId,
      type: event.type,
    });
  }

  private async emitOrEnqueueContentUpdatedEvent(event: EntryUpdatedContentEvent): Promise<void> {
    if (this.eventEmitter.listenerCount(KNOWLEDGE_EVENT_NAMES_CONST.entryUpdatedContent) > 0) {
      this.eventEmitter.emit(KNOWLEDGE_EVENT_NAMES_CONST.entryUpdatedContent, event);
      return;
    }

    await this.indexingOutboxService.enqueueEvent({
      eventName: KNOWLEDGE_EVENT_NAMES_CONST.entryUpdatedContent,
      entryId: event.entryId,
      userId: event.userId,
    });
  }

  private mapEntry(entry: KnowledgeEntryRecord): KnowledgeEntryResponse {
    return {
      id: entry.id,
      userId: entry.userId,
      type: entry.type,
      title: entry.title,
      content: entry.content ?? undefined,
      sourceUrl: entry.sourceUrl ?? undefined,
      filePath: entry.filePath ?? undefined,
      metadata: entry.metadata ?? undefined,
      summary: entry.summary,
      lastError: entry.lastError ?? null,
      status: entry.status,
      tags: entry.tags,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      accessedAt: toIsoDate(entry.accessedAt),
      archivedAt: toIsoDate(entry.archivedAt),
      contentSizeBytes: Buffer.byteLength(entry.content ?? '', 'utf8'),
    };
  }

  private mapListEntry(entry: KnowledgeEntryRecord): KnowledgeEntryResponse {
    const response = this.mapEntry(entry);
    return {
      ...response,
      content: undefined,
    };
  }

  async createEntry(
    userId: string,
    payload: CreateKnowledgeEntryDto,
    options: { skipCreatedEvent?: boolean } = {},
  ): Promise<KnowledgeEntryEnvelopeResponse> {
    const title = trimToUndefined(payload.title);
    const content = trimToUndefined(payload.content);
    const sourceUrl = trimToUndefined(payload.sourceUrl);
    const filePath = trimToUndefined(payload.filePath);
    const metadata = payload.metadata;
    const tags = normalizeTagList(payload.tags);

    this.validatePayload({
      type: payload.type,
      content,
      sourceUrl,
      filePath,
    });

    const entryId = randomUUID();
    await this.knowledgeRepository.createEntry({
      id: entryId,
      userId,
      type: payload.type,
      title: this.generateTitle({
        type: payload.type,
        title,
        content,
        sourceUrl,
        filePath,
      }),
      content,
      sourceUrl,
      filePath,
      metadata,
      status: 'PENDING',
    });
    await this.tagsService.syncEntryTags(userId, entryId, tags);
    if (!options.skipCreatedEvent) {
      await this.emitOrEnqueueCreatedEvent({ entryId, userId, type: payload.type });
    }

    return {
      data: this.mapEntry(
        this.requireEntry(await this.knowledgeRepository.getEntryByIdForUser(userId, entryId)),
      ),
    };
  }

  async listEntries(
    userId: string,
    query: ListKnowledgeEntriesQueryDto,
  ): Promise<KnowledgeEntryListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const result = await this.knowledgeRepository.listEntriesForUser(userId, {
      page,
      limit,
      type: query.type,
      status: query.status,
      tag: query.tag,
      q: query.q,
    });

    return {
      data: result.data.map((entry) => this.mapListEntry(entry)),
      meta: this.paginationHelper.paginate(page, limit, result.total),
    };
  }

  async getEntry(userId: string, entryId: string): Promise<KnowledgeEntryDetailEnvelopeResponse> {
    await this.knowledgeRepository.markAccessed(userId, entryId);
    const detail = await this.knowledgeRepository.getEntryDetailForUser(userId, entryId);
    if (!detail) {
      throw new NotFoundException('Knowledge entry not found');
    }

    return {
      data: {
        ...this.mapEntry(detail),
        relatedConnectionCount: detail.relatedConnectionCount,
        contentChunkCount: detail.contentChunkCount,
      },
    };
  }

  async updateEntry(
    userId: string,
    entryId: string,
    payload: UpdateKnowledgeEntryDto,
  ): Promise<KnowledgeEntryEnvelopeResponse> {
    const current = this.requireEntry(
      await this.knowledgeRepository.getEntryByIdForUser(userId, entryId),
    );
    if (current.status === 'ARCHIVED') {
      return this.restoreArchivedEntry(userId, current, payload);
    }
    if (current.status === 'INDEXING') {
      throw new ConflictException(
        'Knowledge entry cannot be updated while indexing is in progress',
      );
    }

    const title = trimToUndefined(payload.title) ?? current.title;
    const content =
      payload.content === undefined
        ? (current.content ?? undefined)
        : trimToUndefined(payload.content);
    const sourceUrl =
      payload.sourceUrl === undefined
        ? (current.sourceUrl ?? undefined)
        : trimToUndefined(payload.sourceUrl);
    const filePath =
      payload.filePath === undefined
        ? (current.filePath ?? undefined)
        : trimToUndefined(payload.filePath);
    const metadata =
      payload.metadata === undefined ? (current.metadata ?? undefined) : payload.metadata;

    this.validatePayload({
      type: current.type,
      content,
      sourceUrl,
      filePath,
    });

    const contentChanged =
      payload.content !== undefined ||
      payload.sourceUrl !== undefined ||
      payload.filePath !== undefined;
    await this.knowledgeRepository.updateEntry(userId, entryId, {
      title,
      content: content ?? null,
      sourceUrl: sourceUrl ?? null,
      filePath: filePath ?? null,
      metadata: metadata ?? null,
      summary: contentChanged ? null : current.summary,
      status: contentChanged ? 'PENDING' : current.status,
    });

    if (payload.tags !== undefined) {
      await this.tagsService.syncEntryTags(userId, entryId, normalizeTagList(payload.tags));
    }

    if (contentChanged) {
      await this.emitOrEnqueueContentUpdatedEvent({ entryId, userId });
    }

    return {
      data: this.mapEntry(
        this.requireEntry(await this.knowledgeRepository.getEntryByIdForUser(userId, entryId)),
      ),
    };
  }

  async archiveEntry(userId: string, entryId: string): Promise<void> {
    const current = this.requireEntry(
      await this.knowledgeRepository.getEntryByIdForUser(userId, entryId),
    );
    if (current.status === 'ARCHIVED') {
      return;
    }

    await this.knowledgeRepository.archiveEntry(userId, entryId);
  }

  private async restoreArchivedEntry(
    userId: string,
    current: KnowledgeEntryRecord,
    payload: UpdateKnowledgeEntryDto,
  ): Promise<KnowledgeEntryEnvelopeResponse> {
    const detail = await this.knowledgeRepository.getEntryDetailForUser(userId, current.id);
    if (!detail) {
      throw new NotFoundException('Knowledge entry not found');
    }

    const title = trimToUndefined(payload.title) ?? current.title;
    const content =
      payload.content === undefined
        ? (current.content ?? undefined)
        : trimToUndefined(payload.content);
    const sourceUrl =
      payload.sourceUrl === undefined
        ? (current.sourceUrl ?? undefined)
        : trimToUndefined(payload.sourceUrl);
    const filePath =
      payload.filePath === undefined
        ? (current.filePath ?? undefined)
        : trimToUndefined(payload.filePath);
    const metadata =
      payload.metadata === undefined ? (current.metadata ?? undefined) : payload.metadata;

    this.validatePayload({
      type: current.type,
      content,
      sourceUrl,
      filePath,
    });

    const contentChanged =
      payload.content !== undefined ||
      payload.sourceUrl !== undefined ||
      payload.filePath !== undefined;
    const nextStatus = contentChanged || detail.contentChunkCount === 0 ? 'PENDING' : 'INDEXED';
    await this.knowledgeRepository.updateEntry(userId, current.id, {
      title,
      content: content ?? null,
      sourceUrl: sourceUrl ?? null,
      filePath: filePath ?? null,
      metadata: metadata ?? null,
      summary: nextStatus === 'PENDING' ? null : current.summary,
      status: nextStatus,
      archivedAt: null,
    });

    if (payload.tags !== undefined) {
      await this.tagsService.syncEntryTags(userId, current.id, normalizeTagList(payload.tags));
    }

    if (nextStatus === 'PENDING') {
      await this.emitOrEnqueueCreatedEvent({ entryId: current.id, userId, type: current.type });
    }

    return {
      data: this.mapEntry(
        this.requireEntry(await this.knowledgeRepository.getEntryByIdForUser(userId, current.id)),
      ),
    };
  }

  async findBySourceUrl(userId: string, sourceUrl: string): Promise<KnowledgeEntryResponse | null> {
    const entry = await this.knowledgeRepository.findMostRecentBySourceUrlForUser(
      userId,
      sourceUrl,
    );
    return entry ? this.mapEntry(entry) : null;
  }

  async finalizeIngestedUrlEntry(input: {
    userId: string;
    entryId: string;
    sourceUrl: string;
    content: string;
    title: string;
    metadata?: EntryMetadata;
  }): Promise<void> {
    const current = this.requireEntry(
      await this.knowledgeRepository.getEntryByIdForUser(input.userId, input.entryId),
    );
    if (current.status === 'ARCHIVED') {
      return;
    }

    await this.knowledgeRepository.updateEntry(input.userId, input.entryId, {
      sourceUrl: input.sourceUrl,
      content: input.content,
      title: input.title,
      metadata: input.metadata ?? null,
      summary: null,
      status: 'PENDING',
    });

    await this.emitOrEnqueueContentUpdatedEvent({
      entryId: input.entryId,
      userId: input.userId,
    });
  }

  async markEntryFailed(userId: string, entryId: string, reason: string): Promise<void> {
    await this.knowledgeRepository.updateStatusWithError(entryId, userId, 'FAILED', reason);
  }

  async reindexEntry(
    userId: string,
    entryId: string,
  ): Promise<KnowledgeEntryReindexAcceptedResponse> {
    const current = this.requireEntry(
      await this.knowledgeRepository.getEntryByIdForUser(userId, entryId),
    );
    if (current.status === 'PENDING' || current.status === 'INDEXING') {
      throw new ConflictException('Knowledge entry is already queued or indexing');
    }
    if (current.status === 'ARCHIVED') {
      throw new UnprocessableEntityException('Archived entries cannot be reindexed');
    }

    await this.knowledgeRepository.updateEntry(userId, entryId, {
      status: 'PENDING',
      summary: null,
      lastError: null,
    });
    const jobId = buildIndexingJobId(entryId, Date.now().toString());
    if (this.eventEmitter.listenerCount(KNOWLEDGE_EVENT_NAMES_CONST.entryReindexRequested) > 0) {
      const event: EntryReindexRequestedEvent = { entryId, userId, jobId };
      this.eventEmitter.emit(KNOWLEDGE_EVENT_NAMES_CONST.entryReindexRequested, event);
    } else {
      await this.indexingOutboxService.enqueueReindex({ entryId, userId, jobId });
    }
    return {
      entryId,
      jobId,
      status: 'QUEUED',
    };
  }
}
