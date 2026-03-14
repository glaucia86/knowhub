import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IngestionAcceptedResponseDto {
  @ApiProperty()
  entryId!: string;

  @ApiProperty({ enum: ['PENDING', 'INDEXING', 'INDEXED', 'ARCHIVED', 'FAILED'] })
  status!: 'PENDING' | 'INDEXING' | 'INDEXED' | 'ARCHIVED' | 'FAILED';
}

export class IngestionFileAcceptedResponseDto extends IngestionAcceptedResponseDto {
  @ApiPropertyOptional({ type: [String] })
  warnings?: string[];
}

export class IngestionUrlDeduplicatedResponseDto extends IngestionAcceptedResponseDto {
  @ApiProperty({ default: true })
  deduplicated!: true;
}
