import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { Job } from 'bullmq';
import { Worker } from 'bullmq';
import type { IndexingJobPayload, IndexingStep } from '@knowhub/shared-types';
import { KnowledgeRepository } from '../../knowledge/knowledge.repository';
import { INDEXING_QUEUE, resolveRedisConnection } from './indexing.queue';
import { IndexingAgent } from './indexing.agent';
import { IndexingPermanentError } from './indexing.errors';
import { IndexingService } from './indexing.service';

@Injectable()
export class IndexingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IndexingWorker.name);
  private worker: Worker<IndexingJobPayload> | null = null;

  constructor(
    private readonly indexingAgent: IndexingAgent,
    private readonly indexingService: IndexingService,
    private readonly knowledgeRepository: KnowledgeRepository,
  ) {}

  onModuleInit(): void {
    try {
      this.worker = new Worker(
        INDEXING_QUEUE,
        async (job: Job<IndexingJobPayload>) => this.process(job),
        { connection: resolveRedisConnection() },
      );
      this.worker.on('failed', (job, error) => {
        void this.handleFailed(job, error);
      });
    } catch (error) {
      this.logger.error(`Failed to start IndexingWorker: ${(error as Error).message}`);
      this.worker = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
  }

  private async process(job: Job<IndexingJobPayload>): Promise<void> {
    const { entryId, userId } = job.data;
    const threadId = String(job.id ?? `${entryId}-${Date.now()}`);
    const movedToIndexing = await this.knowledgeRepository.updateStatusIfNotArchived(
      entryId,
      userId,
      'INDEXING',
    );
    if (!movedToIndexing) {
      this.logger.log(`Skipping indexing job ${job.id}: entry ${entryId} is archived or missing`);
      return;
    }
    await this.persistCheckpoint(entryId, threadId, 'LOAD', {
      event: 'job.started',
      jobId: threadId,
      userId,
    });
    this.indexingService.emitStarted(entryId, userId);
    await this.knowledgeRepository.clearLastError(entryId, userId);

    try {
      await this.indexingAgent.run(job.data);
      const movedToIndexed = await this.knowledgeRepository.updateStatusIfCurrent(
        entryId,
        userId,
        'INDEXING',
        'INDEXED',
      );
      if (movedToIndexed) {
        await this.persistCheckpoint(entryId, threadId, 'DONE', {
          event: 'job.completed',
          jobId: threadId,
          userId,
        });
        this.indexingService.emitCompleted(entryId, userId);
        return;
      }

      this.logger.log(
        `Indexing job ${job.id} completed but state changed before finalize for entry ${entryId}`,
      );
    } catch (error) {
      if (error instanceof IndexingPermanentError) {
        await job.discard();
      }
      throw error;
    }
  }

  private async handleFailed(
    job: Job<IndexingJobPayload> | undefined,
    error: Error,
  ): Promise<void> {
    if (!job) {
      this.logger.error(`Indexing job failed without metadata: ${error.message}`);
      return;
    }

    const isPermanent =
      error instanceof IndexingPermanentError || error.name === 'IndexingPermanentError';
    const attempts = job.opts.attempts ?? 1;
    if (!isPermanent && job.attemptsMade < attempts) {
      return;
    }

    const step: IndexingStep =
      isPermanent && error instanceof IndexingPermanentError ? error.step : 'FAILED';
    const threadId = String(job.id ?? `${job.data.entryId}-${Date.now()}`);
    await this.persistCheckpoint(job.data.entryId, threadId, step, {
      event: 'job.failed',
      jobId: threadId,
      userId: job.data.userId,
      error: error.message,
    });
    const markedAsFailed = await this.knowledgeRepository.updateStatusWithErrorIfCurrent(
      job.data.entryId,
      job.data.userId,
      'INDEXING',
      error.message,
    );
    if (!markedAsFailed) {
      this.logger.log(
        `Skipping failure status update for job ${job.id}: entry ${job.data.entryId} state changed`,
      );
      return;
    }
    this.indexingService.emitFailed(job.data.entryId, job.data.userId, step, error.message);
    this.logger.error(`Indexing job failed (${job.id}): ${error.message}`);
  }

  private async persistCheckpoint(
    entryId: string,
    threadId: string,
    step: IndexingStep,
    payload: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.knowledgeRepository.saveIndexingCheckpoint(entryId, threadId, step, payload);
    } catch (error) {
      this.logger.warn(
        `Failed to persist checkpoint for entry ${entryId}: ${(error as Error).message}`,
      );
    }
  }
}
