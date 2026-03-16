import { IndexingPermanentError } from '../indexing.errors';
import type { IndexingState } from '../indexing.types';
import { KnowledgeRepository } from '../../../knowledge/knowledge.repository';

export function createLoaderNode(deps: { repo: KnowledgeRepository }) {
  return async (state: IndexingState): Promise<IndexingState> => {
    const entry = await deps.repo.getEntryByIdInternal(state.entryId);
    if (!entry) {
      throw new IndexingPermanentError('CONTENT_NOT_AVAILABLE: entry not found', 'LOAD');
    }

    const content = entry.content;
    if (!content || content.trim().length === 0) {
      throw new IndexingPermanentError(
        `CONTENT_NOT_AVAILABLE: no textual content for entry ${state.entryId}`,
        'LOAD',
      );
    }

    return { ...state, content, currentStep: 'SPLIT' };
  };
}
