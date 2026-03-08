export const KNOWLEDGE_EVENT_NAMES = {
  entryCreated: 'entry.created',
  entryUpdatedContent: 'entry.updated.content',
} as const;

export type KnowledgeEventName = (typeof KNOWLEDGE_EVENT_NAMES)[keyof typeof KNOWLEDGE_EVENT_NAMES];

export interface EntryCreatedEvent {
  entryId: string;
  userId: string;
  type: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
}

export interface EntryUpdatedContentEvent {
  entryId: string;
  userId: string;
}
