import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import type { IContentLoader, LoaderInput, LoaderOutput } from '@knowhub/shared-types';
import { TextLoader } from './text.loader';

class Semaphore {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maxConcurrency: number) {}

  async acquire(): Promise<() => void> {
    if (this.active < this.maxConcurrency) {
      this.active += 1;
      return () => this.release();
    }

    await new Promise<void>((resolve) => {
      this.waiting.push(resolve);
    });
    this.active += 1;
    return () => this.release();
  }

  private release(): void {
    this.active = Math.max(0, this.active - 1);
    const next = this.waiting.shift();
    if (next) {
      next();
    }
  }
}

@Injectable()
export class PdfLoader implements IContentLoader {
  readonly supportedMimeTypes = ['application/pdf'];
  private readonly semaphore = new Semaphore(
    Math.max(1, Number.parseInt(process.env.MAX_PDF_CONCURRENCY ?? '1', 10) || 1),
  );

  constructor(private readonly textLoader: TextLoader) {}

  async load(input: LoaderInput): Promise<LoaderOutput> {
    if (!input.fileBuffer) {
      throw new Error('PDF file not provided');
    }

    const release = await this.semaphore.acquire();
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(input.fileBuffer) });

      let document: Awaited<typeof loadingTask.promise>;
      try {
        document = await loadingTask.promise;
      } catch (error) {
        if (error instanceof Error && error.message.toLowerCase().includes('password')) {
          throw new UnprocessableEntityException({
            statusCode: 422,
            error: 'PDF_PASSWORD_PROTECTED',
            message:
              'This PDF is password-protected. Remove the password protection before sending.',
          });
        }
        throw error;
      }

      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
        const page = await document.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = (textContent.items as Array<{ str?: string }>)
          .map((item) => item.str ?? '')
          .join(' ')
          .trim();
        pages.push(pageText);
      }

      const hasSelectableText = pages.some((text) => text.length > 0);
      const combinedText = this.textLoader.sanitize(
        pages.filter(Boolean).join('\n\n---PAGE---\n\n'),
      );
      if (combinedText.length === 0) {
        return {
          content: '',
          title: input.userTitle ?? input.fileName ?? 'PDF without title',
          metadata: {
            pageCount: document.numPages,
            hasSelectableText: false,
            sourceFileName: input.fileName,
          },
          qualityWarnings: ['PDF does not contain selectable text. OCR is a future feature.'],
        };
      }

      return {
        content: combinedText,
        title: input.userTitle ?? input.fileName ?? this.textLoader.generateTitle(combinedText),
        metadata: {
          pageCount: document.numPages,
          hasSelectableText,
          sourceFileName: input.fileName,
        },
        qualityWarnings: hasSelectableText
          ? undefined
          : ['PDF does not contain selectable text. OCR is a future feature.'],
      };
    } finally {
      release();
    }
  }
}
