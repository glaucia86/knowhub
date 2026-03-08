import { Module } from '@nestjs/common';
import { IndexingOutboxService } from './indexing-outbox.service';
import { KnowledgeRepository } from './knowledge.repository';

@Module({
  providers: [KnowledgeRepository, IndexingOutboxService],
  exports: [IndexingOutboxService],
})
export class ReindexModule {}
