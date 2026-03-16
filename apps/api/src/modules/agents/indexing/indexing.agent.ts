import { Injectable } from '@nestjs/common';
import type { IndexingJobPayload, IndexingJobResult } from '@knowhub/shared-types';
import { KnowledgeRepository } from '../../knowledge/knowledge.repository';
import { TagsService } from '../../knowledge/tags.service';
import { createEmbeddingNode } from './nodes/embedding.node';
import { createLoaderNode } from './nodes/loader.node';
import { createSplitterNode } from './nodes/splitter.node';
import { createStorageNode } from './nodes/storage.node';
import { createSummaryNode } from './nodes/summary.node';
import { createTagNode } from './nodes/tag.node';
import { EmbeddingService } from './services/embedding.service';
import { createInitialState } from './indexing.types';

@Injectable()
export class IndexingAgent {
  constructor(
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly tagsService: TagsService,
  ) {}

  async run(payload: IndexingJobPayload): Promise<IndexingJobResult> {
    const startedAt = Date.now();
    const loader = createLoaderNode({ repo: this.knowledgeRepository });
    const splitter = createSplitterNode();
    const embedder = createEmbeddingNode({ embeddingService: this.embeddingService });
    const storage = createStorageNode({ repo: this.knowledgeRepository });
    const summarizer = createSummaryNode({ repo: this.knowledgeRepository });
    const tagger = createTagNode({ tagsService: this.tagsService });

    let state = createInitialState(payload);
    state = await loader(state);
    state = await splitter(state);
    state = await embedder(state);
    state = await storage(state);
    state = await summarizer(state);
    state = await tagger(state);

    return {
      entryId: payload.entryId,
      chunksCreated: state.chunks.length,
      summaryGenerated: Boolean(state.summary),
      tagsGenerated: state.suggestedTags,
      durationMs: Date.now() - startedAt,
    };
  }
}
