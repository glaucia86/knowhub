import type { IndexingState } from '../indexing.types';
import { KnowledgeRepository } from '../../../knowledge/knowledge.repository';

function summarizeContent(content: string): string {
  const words = content.split(/\s+/).filter((word) => word.length > 0);
  if (words.length <= 200) {
    return content.trim();
  }
  return `${words.slice(0, 180).join(' ')}...`;
}

export function createSummaryNode(deps: { repo: KnowledgeRepository }) {
  return async (state: IndexingState): Promise<IndexingState> => {
    try {
      const content = state.content ?? '';
      const summary = summarizeContent(content);
      await deps.repo.updateSummary(state.entryId, summary);
      return { ...state, summary, currentStep: 'TAG' };
    } catch {
      return { ...state, summary: null, currentStep: 'TAG' };
    }
  };
}
