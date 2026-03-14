import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { Job } from 'bullmq';
import { Worker } from 'bullmq';
import { fingerprintContent } from '@knowhub/shared-utils';
import { KnowledgeService } from '../../knowledge/knowledge.service';
import { LoaderFactoryService } from '../loaders/loader-factory.service';
import { INGESTION_URL_QUEUE, type UrlFetchJobPayload } from '../ingestion.queue';

interface RedisConnection {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

function resolveRedisConnection(): RedisConnection {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const parsed = new URL(redisUrl);
  const connection: RedisConnection = {
    host: parsed.hostname || 'localhost',
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 6379,
  };

  if (parsed.username) {
    connection.username = decodeURIComponent(parsed.username);
  }
  if (parsed.password) {
    connection.password = decodeURIComponent(parsed.password);
  }

  return connection;
}

@Injectable()
export class UrlFetchWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UrlFetchWorker.name);
  private worker: Worker | null = null;

  constructor(
    private readonly loaderFactory: LoaderFactoryService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  onModuleInit(): void {
    try {
      this.worker = new Worker(
        INGESTION_URL_QUEUE,
        async (job: Job<UrlFetchJobPayload>) => this.process(job),
        { connection: resolveRedisConnection() },
      );
      this.worker.on('failed', (job, error) => {
        this.logger.error(`URL job failed (${job?.id}): ${error.message}`);
      });
    } catch (error) {
      this.logger.error(`Failed to start UrlFetchWorker: ${(error as Error).message}`);
      this.worker = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
  }

  private async process(job: Job<UrlFetchJobPayload>): Promise<void> {
    const { userId, entryId, url, title } = job.data;
    const urlLoader = this.loaderFactory.forRoute('url');

    try {
      const result = await urlLoader.load({
        url,
        userTitle: title,
      });

      await this.knowledgeService.finalizeIngestedUrlEntry({
        userId,
        entryId,
        sourceUrl: url,
        title: result.title,
        content: result.content,
        metadata: result.metadata,
      });

      this.logger.log(
        `URL job completed entry=${entryId} fingerprint=${fingerprintContent(result.content)}`,
      );
    } catch (error) {
      await this.knowledgeService.markEntryFailed(userId, entryId, (error as Error).message);
      throw error;
    }
  }
}
