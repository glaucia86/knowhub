import type { EntryMetadata } from './ingestion.types';

export type KnowledgeEntryType = 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
export type KnowledgeEntryStatus = 'PENDING' | 'INDEXING' | 'INDEXED' | 'ARCHIVED' | 'FAILED';
export type MaintenanceJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'PENDING_STUB';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateKnowledgeEntryRequest {
  type: KnowledgeEntryType;
  title?: string;
  content?: string;
  sourceUrl?: string;
  filePath?: string;
  metadata?: EntryMetadata;
  tags?: string[];
}

export interface UpdateKnowledgeEntryRequest {
  title?: string;
  content?: string;
  sourceUrl?: string;
  filePath?: string;
  metadata?: EntryMetadata;
  tags?: string[];
}

export interface KnowledgeEntryResponse {
  id: string;
  userId: string;
  type: KnowledgeEntryType;
  title: string;
  content?: string;
  sourceUrl?: string;
  filePath?: string;
  metadata?: EntryMetadata;
  summary: string | null;
  status: KnowledgeEntryStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  accessedAt?: string;
  archivedAt?: string;
  contentSizeBytes: number;
}

export interface KnowledgeEntryDetailResponse extends KnowledgeEntryResponse {
  relatedConnectionCount: number;
  contentChunkCount: number;
}

export interface KnowledgeEntryEnvelopeResponse {
  data: KnowledgeEntryResponse;
}

export interface KnowledgeEntryDetailEnvelopeResponse {
  data: KnowledgeEntryDetailResponse;
}

export interface KnowledgeEntryListResponse {
  data: KnowledgeEntryResponse[];
  meta: PaginationMeta;
}

export interface KnowledgeEntryReindexAcceptedResponse {
  entryId: string;
  jobId: string;
  status: 'PENDING_STUB';
}

export interface KnowledgeEntryListQuery {
  page?: number;
  limit?: number;
  type?: KnowledgeEntryType;
  status?: KnowledgeEntryStatus;
  tag?: string;
  q?: string;
}
