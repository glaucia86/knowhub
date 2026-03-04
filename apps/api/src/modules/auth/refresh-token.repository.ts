import { createHash, timingSafeEqual } from 'node:crypto';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { getDatabaseClient } from '../../db/database.client';
import { refreshTokens } from '../../db/schema';

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  clientId: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  revokeReason: string | null;
}

export class RefreshTokenRepository {
  private readonly db = getDatabaseClient().db;

  static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  static safeEqualHash(left: string, right: string): boolean {
    const a = Buffer.from(left, 'hex');
    const b = Buffer.from(right, 'hex');
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  }

  async create(record: RefreshTokenRecord): Promise<void> {
    await this.db.insert(refreshTokens).values({
      id: record.id,
      userId: record.userId,
      clientId: record.clientId,
      tokenHash: record.tokenHash,
      issuedAt: record.issuedAt,
      expiresAt: record.expiresAt,
      revokedAt: record.revokedAt,
      replacedByTokenId: record.replacedByTokenId,
      revokeReason: record.revokeReason,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findActiveByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const rows = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          sql`${refreshTokens.expiresAt} > ${Date.now()}`,
        ),
      )
      .limit(1);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return {
      id: row.id,
      userId: row.userId,
      clientId: row.clientId,
      tokenHash: row.tokenHash,
      issuedAt: row.issuedAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
      replacedByTokenId: row.replacedByTokenId,
      revokeReason: row.revokeReason,
    };
  }

  async revoke(id: string, reason: string, replacedByTokenId?: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        revokeReason: reason,
        replacedByTokenId: replacedByTokenId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(refreshTokens.id, id));
  }
}
