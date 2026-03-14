import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { INGESTION_URL_QUEUE, type UrlFetchJobPayload } from './ingestion.queue';

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
export class IngestionQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IngestionQueueService.name);
  private queue: Queue | null = null;

  onModuleInit(): void {
    try {
      this.queue = new Queue(INGESTION_URL_QUEUE, {
        connection: resolveRedisConnection(),
      });
    } catch (error) {
      this.logger.error(`Failed to initialize URL ingestion queue: ${(error as Error).message}`);
      this.queue = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.queue) {
      await this.queue.close();
      this.queue = null;
    }
  }

  async enqueueUrlFetch(payload: UrlFetchJobPayload): Promise<void> {
    if (!this.queue) {
      throw new Error('URL ingestion queue not initialized');
    }

    await this.queue.add('fetch', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: 100,
      removeOnFail: 100,
      jobId: `url:${payload.entryId}`,
    });
  }
}
