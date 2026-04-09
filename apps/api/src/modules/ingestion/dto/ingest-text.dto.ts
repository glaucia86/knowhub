import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IngestTextDto {
  @ApiProperty({
    description: 'Text to be entered (1–100,000 characters).',
    minLength: 1,
    maxLength: 100000,
  })
  @IsString()
  @MinLength(1, { message: 'Content cannot be empty' })
  @MaxLength(100000, { message: 'Content exceeds the limit of 100,000 characters' })
  content!: string;

  @ApiPropertyOptional({
    description: 'Optional title for the entry.',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Title exceeds the limit of 300 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;
}
