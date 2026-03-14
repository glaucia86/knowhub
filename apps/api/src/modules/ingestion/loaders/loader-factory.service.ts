import { Injectable } from '@nestjs/common';
import type { IContentLoader } from '@knowhub/shared-types';
import { MarkdownLoader } from './markdown.loader';
import { PdfLoader } from './pdf.loader';
import { TextLoader } from './text.loader';
import { UrlLoader } from './url.loader';

export type LoaderRoute = 'text' | 'url' | 'pdf' | 'markdown';

@Injectable()
export class LoaderFactoryService {
  constructor(
    private readonly textLoader: TextLoader,
    private readonly urlLoader: UrlLoader,
    private readonly pdfLoader: PdfLoader,
    private readonly markdownLoader: MarkdownLoader,
  ) {}

  forRoute(route: LoaderRoute): IContentLoader {
    if (route === 'text') {
      return this.textLoader;
    }
    if (route === 'url') {
      return this.urlLoader;
    }
    if (route === 'pdf') {
      return this.pdfLoader;
    }
    return this.markdownLoader;
  }
}
