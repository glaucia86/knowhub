import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPublicUrl } from '../validators/is-public-url.validator';

export class IngestUrlDto {
  @ApiProperty({
    description: 'URL to be ingested (http or https).',
    example: 'https://example.com/article',
  })
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'Invalid URL. Use http:// or https://' },
  )
  @IsPublicUrl({ message: 'URLs to private or loopback IPs are not allowed' })
  url!: string;

  @ApiPropertyOptional({
    description: 'Optional title for the entry.',
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;
}
