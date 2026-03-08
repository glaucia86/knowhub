import type { KnowledgeEntryType } from './knowledge.types';

export const KNOWLEDGE_EVENT_NAMES = {
  entryCreated: 'entry.created',
  entryUpdatedContent: 'entry.updated.content',
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
