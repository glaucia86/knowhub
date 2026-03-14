import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class IngestFileDto {
  @ApiPropertyOptional({
    description: 'Optional title for the created entry.',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;
}
