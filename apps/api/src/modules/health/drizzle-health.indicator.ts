import { sql } from 'drizzle-orm';
import type { HealthDatabaseStatus } from '@knowhub/shared-types';
import { getDatabaseClient } from '../../db/database.client';

export class DrizzleHealthIndicator {
  private readonly db = getDatabaseClient().db;

  async check(): Promise<HealthDatabaseStatus> {
    const startedAt = Date.now();
    try {
      await this.db.run(sql`SELECT 1`);
      return {
        status: 'connected',
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
