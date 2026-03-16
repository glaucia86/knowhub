import { Module } from '@nestjs/common';
import { KnowledgeModule } from '../../knowledge/knowledge.module';
import { TagsModule } from '../../knowledge/tags.module';
import { EmbeddingService } from './services/embedding.service';
import { IndexingAgent } from './indexing.agent';
import { IndexingService } from './indexing.service';
import { IndexingWorker } from './indexing.worker';

@Module({
  imports: [KnowledgeModule, TagsModule],
  providers: [EmbeddingService, IndexingService, IndexingAgent, IndexingWorker],
  exports: [IndexingService],
})
export class IndexingModule {}
