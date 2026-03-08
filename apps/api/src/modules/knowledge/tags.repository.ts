import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { getDatabaseClient } from '../../db/database.client';
import { entryTags, tags } from '../../db/schema';

@Injectable()
export class TagsRepository {
  private readonly db = getDatabaseClient().db;

  async findTagsByUserId(userId: string) {
    return this.db.select().from(tags).where(eq(tags.userId, userId));
  }

  async insertTag(userId: string, name: string): Promise<void> {
    await this.db
      .insert(tags)
      .values({
        id: randomUUID(),
        userId,
        name,
      })
      .onConflictDoNothing();
  }

  async findAssociationsByEntryId(entryId: string) {
    return this.db.select().from(entryTags).where(eq(entryTags.entryId, entryId));
  }

  async deleteAssociation(entryId: string, tagId: string): Promise<void> {
    await this.db
      .delete(entryTags)
      .where(and(eq(entryTags.entryId, entryId), eq(entryTags.tagId, tagId)));
  }

  async insertAssociations(entryId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) {
      return;
    }

    await this.db
      .insert(entryTags)
      .values(tagIds.map((tagId) => ({ entryId, tagId })))
      .onConflictDoNothing();
  }
}
