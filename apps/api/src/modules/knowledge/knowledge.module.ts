import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeRepository } from './knowledge.repository';
import { ReindexModule } from './reindex.module';
import { KnowledgeService } from './knowledge.service';
import { SafeFilePathConstraint } from './safe-file-path.validator';
import { SharedModule } from '../shared/shared.module';
import { TagsModule } from './tags.module';

@Module({
  imports: [EventEmitterModule.forRoot(), SharedModule, TagsModule, ReindexModule],
  controllers: [KnowledgeController],
  providers: [KnowledgeRepository, KnowledgeService, SafeFilePathConstraint],
})
export class KnowledgeModule {}
