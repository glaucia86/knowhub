import type { AIProvider } from './settings.types';
import type { KnowledgeEntryType } from './knowledge.types';

export interface IndexingJobPayload {
  entryId: string;
  userId: string;
  contentType: KnowledgeEntryType;
  triggeredBy: 'entry.created' | 'entry.updated.content' | 'manual-reindex';
  language: string;
  aiProvider: AIProvider;
  aiModel: string;
  embeddingModel: string;
  privacyMode: boolean;
}

export interface IndexingJobResult {
  entryId: string;
  chunksCreated: number;
  summaryGenerated: boolean;
  tagsGenerated: string[];
  durationMs: number;
}

export type IndexingStep =
  | 'LOAD'
  | 'SPLIT'
  | 'EMBED'
  | 'STORE'
  | 'SUMMARIZE'
  | 'TAG'
  | 'DONE'
  | 'FAILED';
