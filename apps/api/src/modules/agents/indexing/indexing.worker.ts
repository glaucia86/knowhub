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
    this.indexingService.emitStarted(entryId, userId);
    await this.knowledgeRepository.clearLastError(entryId, userId);
    await this.knowledgeRepository.updateStatus(entryId, userId, 'INDEXING');

    try {
      await this.indexingAgent.run(job.data);
      await this.knowledgeRepository.updateStatus(entryId, userId, 'INDEXED');
      this.indexingService.emitCompleted(entryId, userId);
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
      isPermanent && error instanceof IndexingPermanentError
        ? (error.step as IndexingStep)
        : 'FAILED';
    await this.knowledgeRepository.updateStatusWithError(
      job.data.entryId,
      job.data.userId,
      'FAILED',
      error.message,
    );
    this.indexingService.emitFailed(job.data.entryId, job.data.userId, step, error.message);
    this.logger.error(`Indexing job failed (${job.id}): ${error.message}`);
  }
}
