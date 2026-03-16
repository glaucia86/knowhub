import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  INDEXING_EVENT_NAMES,
  KNOWLEDGE_EVENT_NAMES,
  type EntryCreatedEvent,
  type EntryReindexRequestedEvent,
  type EntryUpdatedContentEvent,
  type IndexingJobPayload,
  type IndexingProgressEvent,
} from '@knowhub/shared-types';
import { Queue } from 'bullmq';
import { KnowledgeRepository } from '../../knowledge/knowledge.repository';
import { buildIndexingJobId, INDEXING_QUEUE, resolveRedisConnection } from './indexing.queue';

@Injectable()
export class IndexingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexingService.name);
  private queue: Queue<IndexingJobPayload> | null = null;

  private readonly onEntryCreated = (event: EntryCreatedEvent) => {
    void this.enqueueFromEvent(event, 'entry.created');
  };

  private readonly onEntryUpdatedContent = (event: EntryUpdatedContentEvent) => {
    void this.enqueueFromEvent({ ...event, type: 'NOTE' }, 'entry.updated.content');
  };

  private readonly onReindexRequested = (event: EntryReindexRequestedEvent) => {
    void this.enqueueReindexFromEvent(event);
  };

  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private ensureQueue(): Queue<IndexingJobPayload> | null {
    if (this.queue) {
      return this.queue;
    }
    try {
      this.queue = new Queue(INDEXING_QUEUE, { connection: resolveRedisConnection() });
      return this.queue;
    } catch (error) {
      this.logger.warn(`Indexing queue unavailable: ${(error as Error).message}`);
      this.queue = null;
      return null;
    }
  }

  onModuleInit(): void {
    this.ensureQueue();

    this.eventEmitter.on(KNOWLEDGE_EVENT_NAMES.entryCreated, this.onEntryCreated);
    this.eventEmitter.on(KNOWLEDGE_EVENT_NAMES.entryUpdatedContent, this.onEntryUpdatedContent);
    this.eventEmitter.on(KNOWLEDGE_EVENT_NAMES.entryReindexRequested, this.onReindexRequested);
    void this.drainPendingStubs();
  }

  async onModuleDestroy(): Promise<void> {
    this.eventEmitter.off(KNOWLEDGE_EVENT_NAMES.entryCreated, this.onEntryCreated);
    this.eventEmitter.off(KNOWLEDGE_EVENT_NAMES.entryUpdatedContent, this.onEntryUpdatedContent);
    this.eventEmitter.off(KNOWLEDGE_EVENT_NAMES.entryReindexRequested, this.onReindexRequested);
    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
  }

  async enqueueIndexing(
    entryId: string,
    userId: string,
    triggeredBy: IndexingJobPayload['triggeredBy'],
    priority?: number,
    forcedJobId?: string,
  ): Promise<string | null> {
    const queue = this.ensureQueue();
    if (!queue) {
      this.logger.warn(`Queue unavailable; indexing skipped for entry ${entryId}`);
      return null;
    }

    const settings = await this.knowledgeRepository.getUserSettingsForIndexing(userId);
    const entry = await this.knowledgeRepository.getEntryByIdInternal(entryId);
    if (!entry) {
      return null;
    }

    const payload: IndexingJobPayload = {
      entryId,
      userId,
      contentType: entry.type,
      triggeredBy,
      language: settings.language,
      aiProvider: settings.aiProvider,
      aiModel: settings.aiModel,
      embeddingModel: settings.embeddingModel,
      privacyMode: settings.privacyMode,
    };

    const jobId =
      forcedJobId ??
      (triggeredBy === 'manual-reindex'
        ? buildIndexingJobId(entryId, Date.now().toString())
        : buildIndexingJobId(entryId));

    if (triggeredBy !== 'manual-reindex') {
      const existingJob = await queue.getJob(jobId);
      if (existingJob) {
        const state = await existingJob.getState();
        if (state === 'completed' || state === 'failed') {
          await existingJob.remove();
        }
      }
    }

    const job = await queue.add('index', payload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: 200,
      removeOnFail: 100,
      jobId,
      ...(priority !== undefined ? { priority } : {}),
    });
    return job.id ?? null;
  }

  async reindex(entryId: string, userId: string, jobId?: string): Promise<string | null> {
    await this.knowledgeRepository.clearLastError(entryId, userId);
    return this.enqueueIndexing(entryId, userId, 'manual-reindex', 1, jobId);
  }

  private async enqueueReindexFromEvent(event: EntryReindexRequestedEvent): Promise<void> {
    try {
      await this.reindex(event.entryId, event.userId, event.jobId);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue reindex for ${event.entryId}: ${(error as Error).message}`,
      );
    }
  }

  emitProgress(event: IndexingProgressEvent): void {
    this.eventEmitter.emit(event.eventType, event);
  }

  private async enqueueFromEvent(
    event: { entryId: string; userId: string; type?: EntryCreatedEvent['type'] },
    triggeredBy: IndexingJobPayload['triggeredBy'],
  ): Promise<void> {
    try {
      await this.enqueueIndexing(event.entryId, event.userId, triggeredBy);
    } catch (error) {
      this.logger.error(
        `Failed to enqueue indexing for ${event.entryId}: ${(error as Error).message}`,
      );
    }
  }

  private async drainPendingStubs(): Promise<void> {
    try {
      const pendingEntries = await this.knowledgeRepository.getPendingEntriesForDrain();
      if (pendingEntries.length === 0) {
        return;
      }

      const queue = this.ensureQueue();
      if (!queue) {
        this.logger.warn(
          `Indexing queue unavailable; skipping drain of ${pendingEntries.length} pending entries`,
        );
        return;
      }

      for (const entry of pendingEntries) {
        await this.enqueueIndexing(entry.entryId, entry.userId, 'entry.created');
      }
      this.logger.log(`Drained ${pendingEntries.length} pending entries to indexing queue`);
    } catch (error) {
      this.logger.warn(`Pending drain failed: ${(error as Error).message}`);
    }

    try {
      const pendingReindexJobs = await this.knowledgeRepository.getPendingReindexMaintenanceJobs();
      for (const job of pendingReindexJobs) {
        const claimed = await this.knowledgeRepository.markMaintenanceJobRunning(job.id);
        if (!claimed) {
          continue;
        }

        try {
          const queuedJobId = await this.enqueueIndexing(
            job.entryId,
            job.userId,
            'manual-reindex',
            1,
            job.requestedJobId,
          );
          await this.knowledgeRepository.completeMaintenanceJob(job.id, {
            queuedJobId,
            requestedJobId: job.requestedJobId ?? null,
          });
        } catch (error) {
          await this.knowledgeRepository.failMaintenanceJob(job.id, (error as Error).message);
          this.logger.error(
            `Failed to drain reindex maintenance job ${job.id}: ${(error as Error).message}`,
          );
        }
      }

      if (pendingReindexJobs.length > 0) {
        this.logger.log(`Drained ${pendingReindexJobs.length} reindex maintenance jobs`);
      }
    } catch (error) {
      this.logger.warn(`Reindex maintenance drain failed: ${(error as Error).message}`);
    }
  }

  emitStarted(entryId: string, userId: string): void {
    this.emitProgress({
      eventType: INDEXING_EVENT_NAMES.started,
      entryId,
      userId,
      step: 'LOAD',
      progress: 0,
      timestamp: new Date().toISOString(),
    });
  }

  emitCompleted(entryId: string, userId: string): void {
    this.emitProgress({
      eventType: INDEXING_EVENT_NAMES.completed,
      entryId,
      userId,
      step: 'DONE',
      progress: 100,
      timestamp: new Date().toISOString(),
    });
  }

  emitFailed(
    entryId: string,
    userId: string,
    step: IndexingProgressEvent['step'],
    error: string,
  ): void {
    this.emitProgress({
      eventType: INDEXING_EVENT_NAMES.failed,
      entryId,
      userId,
      step,
      progress: 100,
      timestamp: new Date().toISOString(),
      error,
    });
  }
}
