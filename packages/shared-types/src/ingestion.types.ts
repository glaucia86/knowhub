export interface LoaderInput {
  rawText?: string;
  url?: string;
  fileBuffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  userTitle?: string;
  timeoutMs?: number;
}

export interface EntryMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  pageCount?: number;
  pdfTitle?: string;
  hasSelectableText?: boolean;
  sourceFileName?: string;
  encoding?: string;
  chunkSeparator?: string;
}

export interface LoaderOutput {
  content: string;
  title: string;
  metadata?: EntryMetadata;
  qualityWarnings?: string[];
}

export interface IContentLoader {
  load(input: LoaderInput): Promise<LoaderOutput>;
  readonly supportedMimeTypes: string[];
}

export const MARKDOWN_HEADING_SEPARATOR_REGEX = /\n\n\[H[1-6]\] .+\n\n/g;
