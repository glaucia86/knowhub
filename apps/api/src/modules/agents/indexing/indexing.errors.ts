import type { IndexingStep } from '@knowhub/shared-types';

export class IndexingPermanentError extends Error {
  constructor(
    message: string,
    public readonly step: IndexingStep,
  ) {
    super(message);
    this.name = 'IndexingPermanentError';
  }
}
