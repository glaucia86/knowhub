import { Injectable } from '@nestjs/common';

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
      return this.createNoteTitle(input.content);
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

  private createNoteTitle(content: string): string {
    const firstLine = content.split(/\r?\n/u)[0]?.trim() ?? '';
    if (firstLine.length <= 80) {
      return firstLine;
    }

    const truncated = firstLine.slice(0, 80);
    const safeBreakpoint = truncated.lastIndexOf(' ');
    return (safeBreakpoint > 20 ? truncated.slice(0, safeBreakpoint) : truncated).trim();
  }
}
