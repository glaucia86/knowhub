import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { AIProvider, PrivacyMode } from '@knowhub/shared-types';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2,3}(-[A-Z]{2})?$/)
  preferredLanguage?: string;

  @IsOptional()
  @IsIn(['local', 'hybrid'])
  privacyMode?: PrivacyMode;

  @IsOptional()
  @IsIn(['ollama', 'azure'])
  aiProvider?: AIProvider;

  @IsOptional()
  @IsString()
  @MinLength(1)
  aiModel?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  embeddingModel?: string;

  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean;
}
