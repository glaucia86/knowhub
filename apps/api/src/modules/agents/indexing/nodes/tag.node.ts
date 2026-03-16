import type { IndexingState } from '../indexing.types';
import { TagsService } from '../../../knowledge/tags.service';

const STOP_WORDS = new Set([
  'about',
  'after',
  'before',
  'being',
  'como',
  'com',
  'para',
  'that',
  'this',
  'with',
  'from',
  'have',
  'will',
  'your',
  'de',
  'da',
  'do',
  'dos',
  'das',
  'que',
  'uma',
  'para',
  'por',
  'and',
  'the',
  'a',
  'an',
  'to',
  'in',
  'on',
  'of',
  'is',
  'it',
]);

function normalizeTag(value: string): string {
  const normalized = value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
  return normalized.slice(0, 40);
}

function extractTags(content: string): string[] {
  const frequency = new Map<string, number>();
  const words = content.split(/\s+/);
  for (const word of words) {
    const normalized = normalizeTag(word);
    if (normalized.length < 4 || STOP_WORDS.has(normalized)) {
      continue;
    }
    frequency.set(normalized, (frequency.get(normalized) ?? 0) + 1);
  }

  return [...frequency.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 7)
    .map(([tag]) => tag);
}

export function createTagNode(deps: { tagsService: TagsService }) {
  return async (state: IndexingState): Promise<IndexingState> => {
    const suggestedTags = extractTags(state.content ?? '');
    await deps.tagsService.syncSuggestedTags(state.entryId, state.userId, suggestedTags);
    return { ...state, suggestedTags, currentStep: 'DONE' };
  };
}
