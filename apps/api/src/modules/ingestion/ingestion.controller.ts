import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../auth/current-user.decorator';
import { IngestFileDto } from './dto/ingest-file.dto';
import { IngestTextDto } from './dto/ingest-text.dto';
import { IngestUrlDto } from './dto/ingest-url.dto';
import {
  IngestionAcceptedResponseDto,
  IngestionFileAcceptedResponseDto,
  IngestionUrlDeduplicatedResponseDto,
} from './dto/ingestion-response.dto';
import { FileValidationInterceptor } from './interceptors/file-validation.interceptor';
import { IngestionService } from './ingestion.service';

@ApiTags('Ingestion')
@ApiBearerAuth()
@Controller('ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('text')
  @ApiOperation({ summary: 'Ingest free text into a knowledge entry.' })
  @ApiCreatedResponse({ type: IngestionAcceptedResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid payload' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  ingestText(@CurrentUser() userId: string, @Body() body: IngestTextDto) {
    return this.ingestionService.ingestText(userId, body);
  }

  @Post('url')
  @ApiOperation({ summary: 'Ingest public URL asynchronously.' })
  @ApiCreatedResponse({ type: IngestionAcceptedResponseDto })
  @ApiOkResponse({ type: IngestionUrlDeduplicatedResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid URL or SSRF blocked' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  ingestUrl(
    @CurrentUser() userId: string,
    @Body() body: IngestUrlDto,
    @Query('force') force?: string,
  ) {
    return this.ingestionService.ingestUrl(userId, body, force === 'true');
  }

  @Post('file')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest file (.pdf, .txt, .md).' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ type: IngestionFileAcceptedResponseDto })
  @ApiResponse({ status: 400, description: 'Missing file or invalid payload' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 413, description: 'File too large' })
  @ApiResponse({ status: 415, description: 'Unsupported media type' })
  @ApiResponse({ status: 422, description: 'Invalid PDF or encoding' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
    FileValidationInterceptor,
  )
  ingestFile(
    @CurrentUser() userId: string,
    @Body() body: IngestFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ingestionService.ingestFile(userId, body, file);
  }
}
