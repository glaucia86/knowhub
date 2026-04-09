import type { IndexingState } from '../indexing.types';

function splitWithOverlap(content: string, chunkSize: number, chunkOverlap: number): string[] {
  const chunks: string[] = [];
  const safeChunkSize = Math.max(chunkSize, 1);
  const safeOverlap = Math.max(Math.min(chunkOverlap, safeChunkSize - 1), 0);
  let start = 0;

  while (start < content.length) {
    const end = Math.min(start + safeChunkSize, content.length);
    const chunk = content.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (end >= content.length) {
      break;
    }
    start = Math.max(0, end - safeOverlap);
  }

  return chunks.length > 0 ? chunks : [content];
}

export function createSplitterNode() {
  return async (state: IndexingState): Promise<IndexingState> => {
    const content = state.content ?? '';
    const chunks = splitWithOverlap(content, 1000, 200);
    return { ...state, chunks, currentStep: 'EMBED' };
  };
}
