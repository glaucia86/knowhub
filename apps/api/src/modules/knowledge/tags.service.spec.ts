import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TagsService } from './tags.service';
import type { TagsRepository } from './tags.repository';

function createRepositoryMock(overrides: Partial<TagsRepository> = {}): TagsRepository {
  return {
    findTagsByUserId: async () => [],
    insertTag: async () => undefined,
    findAssociationsByEntryId: async () => [],
    deleteAssociation: async () => undefined,
    insertAssociations: async () => undefined,
    ...overrides,
  } as TagsRepository;
}

describe('TagsService', () => {
  it('creates normalized user-scoped tags and associations', async () => {
    const insertedTags: Array<{ userId: string; name: string }> = [];
    const insertedAssociations: Array<{ entryId: string; tagIds: string[] }> = [];
    const tagsByUser = new Map([
      ['user-1', [] as Array<{ id: string; userId: string; name: string }>],
    ]);
    let tagIndex = 0;

    const service = new TagsService(
      createRepositoryMock({
        findTagsByUserId: async (userId: string) => tagsByUser.get(userId) ?? [],
        insertTag: async (userId: string, name: string) => {
          insertedTags.push({ userId, name });
          const nextTag = { id: `tag-${++tagIndex}`, userId, name };
          tagsByUser.set(userId, [...(tagsByUser.get(userId) ?? []), nextTag]);
        },
        insertAssociations: async (entryId: string, tagIds: string[]) => {
          insertedAssociations.push({ entryId, tagIds });
        },
      }),
    );

    await service.syncEntryTags('user-1', 'entry-1', ['TypeScript', 'typescript', ' NestJS ']);

    assert.deepEqual(
      insertedTags.map((tag) => tag.name),
      ['typescript', 'nestjs'],
    );
    assert.deepEqual(insertedAssociations, [{ entryId: 'entry-1', tagIds: ['tag-1', 'tag-2'] }]);
  });

  it('removes obsolete associations and skips inserts when there are no missing ids', async () => {
    const deletedAssociations: Array<{ entryId: string; tagId: string }> = [];
    let insertAssociationCalls = 0;

    const service = new TagsService(
      createRepositoryMock({
        findTagsByUserId: async () => [
          { id: 'tag-1', userId: 'user-1', name: 'typescript' },
          { id: 'tag-2', userId: 'user-1', name: 'nestjs' },
        ],
        findAssociationsByEntryId: async () => [
          { entryId: 'entry-1', tagId: 'tag-1' },
          { entryId: 'entry-1', tagId: 'tag-2' },
        ],
        deleteAssociation: async (entryId: string, tagId: string) => {
          deletedAssociations.push({ entryId, tagId });
        },
        insertAssociations: async (_entryId: string, tagIds: string[]) => {
          if (tagIds.length > 0) {
            insertAssociationCalls += 1;
          }
        },
      }),
    );

    await service.syncEntryTags('user-1', 'entry-1', ['nestjs']);

    assert.deepEqual(deletedAssociations, [{ entryId: 'entry-1', tagId: 'tag-1' }]);
    assert.equal(insertAssociationCalls, 0);
  });

  it('returns early for empty suggested tags', async () => {
    let findTagsCalls = 0;
    const service = new TagsService(
      createRepositoryMock({
        findTagsByUserId: async () => {
          findTagsCalls += 1;
          return [];
        },
      }),
    );

    await service.syncSuggestedTags('entry-1', 'user-1', []);

    assert.equal(findTagsCalls, 0);
  });

  it('creates and associates only missing suggested tags', async () => {
    const insertedTags: Array<{ userId: string; name: string }> = [];
    const insertedAssociations: Array<{ entryId: string; tagIds: string[] }> = [];
    let findTagsCalls = 0;
    const service = new TagsService(
      createRepositoryMock({
        findTagsByUserId: async () => {
          findTagsCalls += 1;
          if (findTagsCalls === 1) {
            return [{ id: 'tag-1', userId: 'user-1', name: 'nestjs' }];
          }
          return [
            { id: 'tag-1', userId: 'user-1', name: 'nestjs' },
            { id: 'tag-2', userId: 'user-1', name: 'queue' },
          ];
        },
        insertTag: async (userId: string, name: string) => {
          insertedTags.push({ userId, name });
        },
        findAssociationsByEntryId: async () => [{ entryId: 'entry-1', tagId: 'tag-1' }],
        insertAssociations: async (entryId: string, tagIds: string[]) => {
          insertedAssociations.push({ entryId, tagIds });
        },
      }),
    );

    await service.syncSuggestedTags('entry-1', 'user-1', ['NestJS', 'queue']);

    assert.deepEqual(insertedTags, [{ userId: 'user-1', name: 'queue' }]);
    assert.deepEqual(insertedAssociations, [{ entryId: 'entry-1', tagIds: ['tag-2'] }]);
  });
});
