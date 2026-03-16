import { IndexingPermanentError } from '../indexing.errors';
import type { IndexingState } from '../indexing.types';
import { EmbeddingService } from '../services/embedding.service';

export function createEmbeddingNode(deps: { embeddingService: EmbeddingService }) {
  return async (state: IndexingState): Promise<IndexingState> => {
    if (state.privacyMode && state.aiProvider === 'azure') {
      throw new IndexingPermanentError(
        'PRIVACY_VIOLATION: azure provider blocked in local privacy mode',
        'EMBED',
      );
    }

    const embeddings = await deps.embeddingService.embedBatch({
      provider: state.aiProvider,
      model: state.aiModel,
      texts: state.chunks,
    });

    return { ...state, embeddings, currentStep: 'STORE' };
  };
}
