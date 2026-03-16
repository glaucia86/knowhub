import type { IndexingJobPayload } from '@knowhub/shared-types';

export const INDEXING_QUEUE = 'indexing-queue';
export type { IndexingJobPayload };

export function buildIndexingJobId(entryId: string, nonce?: string): string {
  if (nonce) {
    return `indexing-${entryId}-${nonce}`;
  }
  return `indexing-${entryId}`;
}

interface RedisConnection {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export function resolveRedisConnection(): RedisConnection {
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
