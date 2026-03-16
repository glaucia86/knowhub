import { ApiProperty } from '@nestjs/swagger';
import type { EntryMetadata } from '@knowhub/shared-types';

export class PaginationMetaDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;
}

export class KnowledgeEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ['NOTE', 'LINK', 'PDF', 'GITHUB'] })
  type!: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';

  @ApiProperty()
  title!: string;

  @ApiProperty({ required: false })
  content?: string;

  @ApiProperty({ required: false })
  sourceUrl?: string;

  @ApiProperty({ required: false })
  filePath?: string;

  @ApiProperty({ required: false, type: Object })
  metadata?: EntryMetadata;

  @ApiProperty({ nullable: true })
  summary!: string | null;

  @ApiProperty({ nullable: true })
  lastError!: string | null;

  @ApiProperty({ enum: ['PENDING', 'INDEXING', 'INDEXED', 'ARCHIVED', 'FAILED'] })
  status!: 'PENDING' | 'INDEXING' | 'INDEXED' | 'ARCHIVED' | 'FAILED';

  @ApiProperty({ type: [String] })
  tags!: string[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ required: false })
  accessedAt?: string;

  @ApiProperty({ required: false })
  archivedAt?: string;

  @ApiProperty()
  contentSizeBytes!: number;
}

export class KnowledgeEntryDetailResponseDto extends KnowledgeEntryResponseDto {
  @ApiProperty()
  relatedConnectionCount!: number;

  @ApiProperty()
  contentChunkCount!: number;
}

export class KnowledgeEntryEnvelopeResponseDto {
  @ApiProperty({ type: KnowledgeEntryResponseDto })
  data!: KnowledgeEntryResponseDto;
}

export class KnowledgeEntryDetailEnvelopeResponseDto {
  @ApiProperty({ type: KnowledgeEntryDetailResponseDto })
  data!: KnowledgeEntryDetailResponseDto;
}

export class KnowledgeEntryListResponseDto {
  @ApiProperty({ type: [KnowledgeEntryResponseDto] })
  data!: KnowledgeEntryResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}

export class KnowledgeEntryReindexAcceptedResponseDto {
  @ApiProperty()
  entryId!: string;

  @ApiProperty()
  jobId!: string;

  @ApiProperty({ enum: ['QUEUED'] })
  status!: 'QUEUED';
}
