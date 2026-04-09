import { createHash } from 'node:crypto';

export interface FingerprintContentOptions {
  maxChars?: number;
}

export function fingerprintContent(
  content: string,
  options: FingerprintContentOptions = {},
): string {
  const maxChars = options.maxChars ?? 1000;
  const sample = content.slice(0, maxChars);
  return createHash('sha256').update(sample).digest('hex');
}
