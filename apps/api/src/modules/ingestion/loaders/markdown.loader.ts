import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { remark } from 'remark';
import strip from 'strip-markdown';
import { detect } from 'chardet';
import iconv from 'iconv-lite';
import {
  MARKDOWN_HEADING_SEPARATOR_REGEX,
  type IContentLoader,
  type LoaderInput,
  type LoaderOutput,
} from '@knowhub/shared-types';
import { TextLoader } from './text.loader';

@Injectable()
export class MarkdownLoader implements IContentLoader {
  readonly supportedMimeTypes = ['text/markdown', 'text/plain', 'application/octet-stream'];

  constructor(private readonly textLoader: TextLoader) {}

  async load(input: LoaderInput): Promise<LoaderOutput> {
    if (!input.fileBuffer) {
      throw new Error('Text/Markdown file not provided');
    }

    const encoding = this.detectEncoding(input.fileBuffer);
    const decoded = iconv.decode(input.fileBuffer, encoding);
    const isMarkdown = (input.fileName ?? '').toLowerCase().endsWith('.md');
    const rawText = isMarkdown ? await this.normalizeMarkdown(decoded) : decoded;

    const content = this.textLoader.sanitize(rawText);
    if (content.length === 0) {
      throw new Error('File does not contain useful text after sanitization');
    }

    const title = input.userTitle ?? this.textLoader.generateTitle(content);
    return {
      content,
      title,
      metadata: {
        sourceFileName: input.fileName,
        encoding,
        chunkSeparator: MARKDOWN_HEADING_SEPARATOR_REGEX.source,
      },
    };
  }

  private detectEncoding(buffer: Buffer): string {
    const detected = detect(buffer);
    if (!detected) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        error: 'UNSUPPORTED_ENCODING',
        message: 'File encoding could not be determined. Please save as UTF-8 and try again.',
      });
    }

    const normalized = detected.toString().toLowerCase();
    if (normalized.includes('utf')) {
      return 'utf-8';
    }
    if (normalized.includes('8859') || normalized.includes('latin1')) {
      return 'latin1';
    }

    return normalized;
  }

  private async normalizeMarkdown(markdown: string): Promise<string> {
    const withHeadingSeparators = markdown.replace(
      /^(#{1,6})\s+(.+)$/gmu,
      (_full, hashes: string, headingText: string) =>
        `\n\n[H${hashes.length}] ${headingText.trim()}\n\n`,
    );

    const processed = await remark().use(strip).process(withHeadingSeparators);
    return String(processed);
  }
}
