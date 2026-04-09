import { Module } from '@nestjs/common';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { IngestionController } from './ingestion.controller';
import { IngestionQueueService } from './ingestion-queue.service';
import { IngestionService } from './ingestion.service';
import { FileValidationInterceptor } from './interceptors/file-validation.interceptor';
import { LoaderFactoryService } from './loaders/loader-factory.service';
import { MarkdownLoader } from './loaders/markdown.loader';
import { PdfLoader } from './loaders/pdf.loader';
import { PlaywrightService } from './loaders/playwright.service';
import { TextLoader } from './loaders/text.loader';
import { UrlLoader } from './loaders/url.loader';
import { IsPublicUrlConstraint } from './validators/is-public-url.validator';
import { UrlFetchWorker } from './workers/url-fetch.worker';

@Module({
  imports: [KnowledgeModule],
  controllers: [IngestionController],
  providers: [
    IngestionService,
    IngestionQueueService,
    UrlFetchWorker,
    LoaderFactoryService,
    TextLoader,
    UrlLoader,
    PdfLoader,
    MarkdownLoader,
    PlaywrightService,
    FileValidationInterceptor,
    IsPublicUrlConstraint,
  ],
})
export class IngestionModule {}
