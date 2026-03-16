import type { KnowledgeEntryType } from './knowledge.types';
import type { IndexingStep } from './agents.types';

export const KNOWLEDGE_EVENT_NAMES = {
  entryCreated: 'entry.created',
  entryUpdatedContent: 'entry.updated.content',
  entryReindexRequested: 'entry.reindex-requested',
} as const;

export type KnowledgeEventName = (typeof KNOWLEDGE_EVENT_NAMES)[keyof typeof KNOWLEDGE_EVENT_NAMES];

export interface EntryCreatedEvent {
  entryId: string;
  userId: string;
  type: KnowledgeEntryType;
}

export interface EntryUpdatedContentEvent {
  entryId: string;
  userId: string;
}

export interface EntryReindexRequestedEvent {
  entryId: string;
  userId: string;
  jobId?: string;
}

export const INDEXING_EVENT_NAMES = {
  started: 'entry.indexing.started',
  progress: 'entry.indexing.progress',
  completed: 'entry.indexing.completed',
  failed: 'entry.indexing.failed',
} as const;

export type IndexingEventName = (typeof INDEXING_EVENT_NAMES)[keyof typeof INDEXING_EVENT_NAMES];

export interface IndexingProgressEvent {
  eventType: IndexingEventName;
  entryId: string;
  userId: string;
  step: IndexingStep;
  progress: number;
  timestamp: string;
  error?: string;
}
