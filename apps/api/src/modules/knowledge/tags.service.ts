import { Injectable } from '@nestjs/common';
import { normalizeTagList } from './knowledge.helpers';
import { TagsRepository } from './tags.repository';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  async syncEntryTags(
    userId: string,
    entryId: string,
    tagNames: string[] | undefined,
  ): Promise<void> {
    const normalizedTags = normalizeTagList(tagNames);
    const userTags = await this.tagsRepository.findTagsByUserId(userId);
    const tagByName = new Map(userTags.map((tag) => [tag.name, tag]));

    for (const tagName of normalizedTags) {
      if (tagByName.has(tagName)) {
        continue;
      }

      await this.tagsRepository.insertTag(userId, tagName);
      const refreshedTags = await this.tagsRepository.findTagsByUserId(userId);
      const insertedTag = refreshedTags.find((tag) => tag.name === tagName);
      if (insertedTag) {
        tagByName.set(tagName, insertedTag);
      }
    }

    const desiredTagIds = normalizedTags
      .map((tagName) => tagByName.get(tagName)?.id)
      .filter((tagId): tagId is string => typeof tagId === 'string');
    const currentAssociations = await this.tagsRepository.findAssociationsByEntryId(entryId);
    const desiredSet = new Set(desiredTagIds);

    for (const association of currentAssociations) {
      if (!desiredSet.has(association.tagId)) {
        await this.tagsRepository.deleteAssociation(entryId, association.tagId);
      }
    }

    const currentSet = new Set(currentAssociations.map((association) => association.tagId));
    const missingTagIds = desiredTagIds.filter((tagId) => !currentSet.has(tagId));
    await this.tagsRepository.insertAssociations(entryId, missingTagIds);
  }
}
