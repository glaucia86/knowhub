import { randomUUID } from 'node:crypto';
import type { IndexingState } from '../indexing.types';
import { KnowledgeRepository } from '../../../knowledge/knowledge.repository';

export function createStorageNode(deps: { repo: KnowledgeRepository }) {
  return async (state: IndexingState): Promise<IndexingState> => {
    await deps.repo.deleteChunksByEntryId(state.entryId);
    await deps.repo.insertChunksBatch(
      state.chunks.map((chunk, index) => ({
        id: randomUUID(),
        entryId: state.entryId,
        chunkIndex: index,
        content: chunk,
        tokenCount: Math.max(1, Math.ceil(chunk.length / 4)),
        embedding: state.embeddings[index] ?? null,
        embeddingModel: `${state.aiProvider}:${state.aiModel}`,
      })),
    );

    return { ...state, currentStep: 'SUMMARIZE' };
  };
}
