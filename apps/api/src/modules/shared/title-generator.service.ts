import { Injectable } from '@nestjs/common';
import { createNoteTitle } from '../knowledge/knowledge.helpers';

@Injectable()
export class TitleGeneratorService {
  generate(input: {
    type: 'NOTE' | 'LINK' | 'PDF' | 'GITHUB';
    title?: string;
    content?: string;
    sourceUrl?: string;
    filePath?: string;
  }): string | null {
    if (input.title) {
      return input.title;
    }

    if (input.type === 'NOTE' && input.content) {
      return createNoteTitle(input.content);
    }

    if (input.type === 'LINK' && input.sourceUrl) {
      return new URL(input.sourceUrl).hostname;
    }

    if (input.type === 'GITHUB' && input.sourceUrl) {
      const url = new URL(input.sourceUrl);
      const [owner, repo] = url.pathname.replace(/^\/+/, '').split('/');
      if (owner && repo) {
        return `GitHub: ${owner}/${repo}`;
      }
      return `GitHub: ${url.hostname}`;
    }

    if (input.type === 'PDF' && input.filePath) {
      return input.filePath.split(/[\\/]/u).at(-1) ?? input.filePath;
    }

    if (input.content) {
      return input.content.slice(0, 80);
    }

    return null;
  }
}
