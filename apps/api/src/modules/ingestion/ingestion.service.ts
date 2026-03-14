import path from 'node:path';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import type {
  IngestionAcceptedResponseDto,
  IngestionFileAcceptedResponseDto,
  IngestionUrlDeduplicatedResponseDto,
} from './dto/ingestion-response.dto';
import type { IngestTextDto } from './dto/ingest-text.dto';
import type { IngestFileDto } from './dto/ingest-file.dto';
import type { IngestUrlDto } from './dto/ingest-url.dto';
import { IngestionQueueService } from './ingestion-queue.service';
import { LoaderFactoryService } from './loaders/loader-factory.service';
import { KnowledgeService } from '../knowledge/knowledge.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly loaderFactory: LoaderFactoryService,
    private readonly knowledgeService: KnowledgeService,
    private readonly queueService: IngestionQueueService,
  ) {}

  async ingestText(userId: string, payload: IngestTextDto): Promise<IngestionAcceptedResponseDto> {
    const textLoader = this.loaderFactory.forRoute('text');
    const result = await textLoader.load({
      rawText: payload.content,
      userTitle: payload.title,
    });

    const created = await this.knowledgeService.createEntry(userId, {
      type: 'NOTE',
      title: result.title,
      content: result.content,
      metadata: result.metadata,
    });

    return {
      entryId: created.data.id,
      status: created.data.status,
    };
  }

  async ingestFile(
    userId: string,
    payload: IngestFileDto,
    file: Express.Multer.File,
  ): Promise<IngestionFileAcceptedResponseDto> {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeFileName = path.basename(file.originalname);
    const isPdf = extension === '.pdf';

    const loader = this.loaderFactory.forRoute(isPdf ? 'pdf' : 'markdown');
    const result = await loader.load({
      fileBuffer: file.buffer,
      fileName: safeFileName,
      mimeType: file.mimetype,
      userTitle: payload.title,
    });

    const created = await this.knowledgeService.createEntry(userId, {
      type: isPdf ? 'PDF' : 'NOTE',
      title: result.title,
      content: result.content.length > 0 ? result.content : undefined,
      filePath: isPdf ? `uploads/${safeFileName}` : undefined,
      metadata: result.metadata,
    });

    return {
      entryId: created.data.id,
      status: created.data.status,
      warnings: result.qualityWarnings,
    };
  }

  async ingestUrl(
    userId: string,
    payload: IngestUrlDto,
    force = false,
  ): Promise<IngestionAcceptedResponseDto | IngestionUrlDeduplicatedResponseDto> {
    const canonicalUrl = this.canonicalizeUrl(payload.url);
    const existing = await this.knowledgeService.findBySourceUrl(userId, canonicalUrl);
    if (existing && existing.status !== 'ARCHIVED' && !force) {
      return {
        entryId: existing.id,
        status: existing.status,
        deduplicated: true,
      };
    }

    const placeholder = await this.knowledgeService.createEntry(
      userId,
      {
        type: 'LINK',
        title: payload.title ?? new URL(canonicalUrl).hostname,
        sourceUrl: canonicalUrl,
      },
      { skipCreatedEvent: true },
    );

    try {
      await this.queueService.enqueueUrlFetch({
        entryId: placeholder.data.id,
        userId,
        url: canonicalUrl,
        title: payload.title,
      });
    } catch (error) {
      const message = (error as Error).message;
      this.logger.warn(
        `Queue unavailable for URL ingestion (${canonicalUrl}): ${message}. Falling back to inline processing.`,
      );

      try {
        await this.processUrlInline(userId, placeholder.data.id, canonicalUrl, payload.title);
      } catch (inlineError) {
        const inlineMessage = (inlineError as Error).message;
        this.logger.error(`Inline URL ingestion failed for ${canonicalUrl}: ${inlineMessage}`);
        await this.knowledgeService.markEntryFailed(
          userId,
          placeholder.data.id,
          `Failed to enqueue URL ingestion: ${message}`,
        );
        throw new InternalServerErrorException('Failed to enqueue URL ingestion');
      }
    }

    return {
      entryId: placeholder.data.id,
      status: 'PENDING',
    };
  }

  private async processUrlInline(
    userId: string,
    entryId: string,
    url: string,
    userTitle?: string,
  ): Promise<void> {
    const urlLoader = this.loaderFactory.forRoute('url');
    const result = await urlLoader.load({
      url,
      userTitle,
    });

    await this.knowledgeService.finalizeIngestedUrlEntry({
      userId,
      entryId,
      sourceUrl: url,
      title: result.title,
      content: result.content,
      metadata: result.metadata,
    });
  }

  private canonicalizeUrl(url: string): string {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('URL invalida. Use http:// ou https://');
    }

    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    if (
      (parsed.protocol === 'http:' && parsed.port === '80') ||
      (parsed.protocol === 'https:' && parsed.port === '443')
    ) {
      parsed.port = '';
    }
    if (parsed.pathname.length > 1) {
      parsed.pathname = parsed.pathname.replace(/\/+$/u, '');
    }

    return parsed.toString();
  }
}
