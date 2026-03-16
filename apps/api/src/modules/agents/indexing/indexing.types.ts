import type { AIProvider, IndexingStep, KnowledgeEntryType } from '@knowhub/shared-types';

export interface IndexingState {
  entryId: string;
  userId: string;
  content: string | null;
  contentType: KnowledgeEntryType;
  language: string;
  aiProvider: AIProvider;
  aiModel: string;
  privacyMode: boolean;
  chunks: string[];
  embeddings: number[][];
  summary: string | null;
  suggestedTags: string[];
  currentStep: IndexingStep;
  error: string | null;
}

export function createInitialState(input: {
  entryId: string;
  userId: string;
  contentType: KnowledgeEntryType;
  language: string;
  aiProvider: AIProvider;
  aiModel: string;
  privacyMode: boolean;
}): IndexingState {
  return {
    entryId: input.entryId,
    userId: input.userId,
    content: null,
    contentType: input.contentType,
    language: input.language,
    aiProvider: input.aiProvider,
    aiModel: input.aiModel,
    privacyMode: input.privacyMode,
    chunks: [],
    embeddings: [],
    summary: null,
    suggestedTags: [],
    currentStep: 'LOAD',
    error: null,
  };
}
