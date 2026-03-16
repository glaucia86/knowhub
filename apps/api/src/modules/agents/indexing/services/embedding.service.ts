import { Injectable } from '@nestjs/common';
import type { AIProvider } from '@knowhub/shared-types';
import { MockEmbeddingModel } from '../models/mock-embedding.model';

@Injectable()
export class EmbeddingService {
  getDimensions(provider: AIProvider): number {
    return provider === 'azure' ? 1536 : 768;
  }

  async embedBatch(input: {
    provider: AIProvider;
    model: string;
    texts: string[];
  }): Promise<number[][]> {
    const dimensions = this.getDimensions(input.provider);
    const mockModel = new MockEmbeddingModel(dimensions);
    return input.texts.map((text) => mockModel.embed(`${input.model}:${text}`));
  }
}
