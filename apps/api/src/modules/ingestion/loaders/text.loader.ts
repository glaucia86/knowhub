import { BadRequestException, Injectable } from '@nestjs/common';
import type { IContentLoader, LoaderInput, LoaderOutput } from '@knowhub/shared-types';

@Injectable()
export class TextLoader implements IContentLoader {
  readonly supportedMimeTypes = ['text/plain'];

  async load(input: LoaderInput): Promise<LoaderOutput> {
    const rawText = input.rawText ?? '';
    const content = this.sanitize(rawText);
    if (content.length === 0) {
      throw new BadRequestException('Content cannot be empty');
    }

    const title = input.userTitle ?? this.generateTitle(content);
    return { content, title };
  }

  sanitize(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  generateTitle(content: string): string {
    if (content.length <= 80) {
      return content;
    }

    const truncated = content.slice(0, 80);
    const lastSpace = truncated.lastIndexOf(' ');
    const base = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
    return `${base}...`;
  }
}
