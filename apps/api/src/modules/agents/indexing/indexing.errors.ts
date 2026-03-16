export class IndexingPermanentError extends Error {
  constructor(
    message: string,
    public readonly step: string,
  ) {
    super(message);
    this.name = 'IndexingPermanentError';
  }
}
