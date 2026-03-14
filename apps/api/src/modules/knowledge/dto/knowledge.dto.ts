import { Type } from 'class-transformer';
import {
  ArrayUnique,
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsObject,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  EntryMetadata,
  KnowledgeEntryListQuery,
  KnowledgeEntryStatus,
  KnowledgeEntryType,
} from '@knowhub/shared-types';
import { IsSafeFilePath } from '../safe-file-path.validator';

export class CreateKnowledgeEntryDto {
  @ApiProperty({ enum: ['NOTE', 'LINK', 'PDF', 'GITHUB'] })
  @IsIn(['NOTE', 'LINK', 'PDF', 'GITHUB'])
  type!: KnowledgeEntryType;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 100000 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100000)
  content?: string;

  @ApiPropertyOptional({ maxLength: 2048 })
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  sourceUrl?: string;

  @ApiPropertyOptional({ maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  @IsSafeFilePath()
  filePath?: string;

  @ApiPropertyOptional({ description: 'Optional ingestion metadata object.' })
  @IsOptional()
  @IsObject()
  metadata?: EntryMetadata;

  @ApiPropertyOptional({ type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}

export class UpdateKnowledgeEntryDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ maxLength: 100000 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100000)
  content?: string;

  @ApiPropertyOptional({ maxLength: 2048 })
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  sourceUrl?: string;

  @ApiPropertyOptional({ maxLength: 1024 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  @IsSafeFilePath()
  filePath?: string;

  @ApiPropertyOptional({ description: 'Optional ingestion metadata object.' })
  @IsOptional()
  @IsObject()
  metadata?: EntryMetadata;

  @ApiPropertyOptional({ type: [String], maxItems: 20 })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(50, { each: true })
  tags?: string[];
}

export class ListKnowledgeEntriesQueryDto implements KnowledgeEntryListQuery {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: ['NOTE', 'LINK', 'PDF', 'GITHUB'] })
  @IsOptional()
  @IsIn(['NOTE', 'LINK', 'PDF', 'GITHUB'])
  type?: KnowledgeEntryType;

  @ApiPropertyOptional({ enum: ['PENDING', 'INDEXING', 'INDEXED', 'ARCHIVED', 'FAILED'] })
  @IsOptional()
  @IsIn(['PENDING', 'INDEXING', 'INDEXED', 'ARCHIVED', 'FAILED'])
  status?: KnowledgeEntryStatus;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  tag?: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  q?: string;
}
