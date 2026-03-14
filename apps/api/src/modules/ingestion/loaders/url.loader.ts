import { lookup } from 'node:dns/promises';
import { Injectable, Logger } from '@nestjs/common';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import type {
  EntryMetadata,
  IContentLoader,
  LoaderInput,
  LoaderOutput,
} from '@knowhub/shared-types';
import { fingerprintContent, withRetry } from '@knowhub/shared-utils';
import { PlaywrightService } from './playwright.service';
import { TextLoader } from './text.loader';

const PRIVATE_IP_RANGES: RegExp[] = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((regex) => regex.test(ip));
}

@Injectable()
export class UrlLoader implements IContentLoader {
  private readonly logger = new Logger(UrlLoader.name);
  readonly supportedMimeTypes = ['text/html'];

  constructor(
    private readonly playwright: PlaywrightService,
    private readonly textLoader: TextLoader,
  ) {}

  async load(input: LoaderInput): Promise<LoaderOutput> {
    if (!input.url) {
      throw new Error('URL not provided');
    }

    const timeoutMs =
      input.timeoutMs ?? Number.parseInt(process.env.INGEST_URL_TIMEOUT_MS ?? '15000', 10);
    let html: string | null = null;

    if (this.playwright.isAvailable()) {
      try {
        html = await withRetry(
          () =>
            this.playwright.fetchHtml(input.url!, timeoutMs, async (requestUrl: string) => {
              await this.validatePublicAddress(requestUrl);
            }),
          {
            maxAttempts: 3,
            baseDelayMs: 1000,
            onlyOnNetworkErrors: true,
          },
        );
      } catch (error) {
        this.logger.warn(`Playwright failed for ${input.url}: ${(error as Error).message}`);
      }
    }

    if (!html) {
      html = await withRetry(() => this.fetchHtmlWithSecurity(input.url!, timeoutMs), {
        maxAttempts: 3,
        baseDelayMs: 1000,
        shouldRetry: (error) => !(error as { isClientError?: boolean }).isClientError,
      });
    }

    const dom = new JSDOM(html, { url: input.url });
    const article = new Readability(dom.window.document).parse();
    const readableText = article?.textContent ?? '';
    const fallbackText = cheerio.load(html)('body').text();
    const content = this.textLoader.sanitize(readableText || fallbackText);
    if (content.length === 0) {
      throw new Error('Unable to extract textual content from the URL');
    }

    const metadata = this.extractOpenGraph(html);
    const title =
      input.userTitle ?? metadata.ogTitle ?? article?.title ?? new URL(input.url).hostname;

    this.logger.log(
      `URL processed: ${input.url} | size=${content.length} | fingerprint=${fingerprintContent(content)}`,
    );

    return {
      content,
      title,
      metadata,
    };
  }

  private async validatePublicAddress(url: string): Promise<void> {
    const { hostname } = new URL(url);
    const result = await lookup(hostname);
    if (isPrivateIp(result.address)) {
      throw Object.assign(new Error('URL points to a private address'), { isClientError: true });
    }
  }

  private async fetchHtmlWithSecurity(url: string, timeoutMs: number): Promise<string> {
    let current = url;
    const maxRedirects = 5;

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
      await this.validatePublicAddress(current);
      const response = await fetch(current, {
        signal: AbortSignal.timeout(timeoutMs),
        redirect: 'manual',
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Redirect without location header');
        }

        current = new URL(location, current).toString();
        continue;
      }

      if (response.status >= 400 && response.status < 500) {
        throw Object.assign(new Error(`HTTP ${response.status} ${response.statusText}`), {
          isClientError: true,
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return response.text();
    }

    throw new Error('Maximum number of redirects exceeded');
  }

  private extractOpenGraph(html: string): EntryMetadata {
    const $ = cheerio.load(html);
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');

    return {
      ogTitle: ogTitle?.trim() || undefined,
      ogDescription: ogDescription?.trim() || undefined,
      ogImage: ogImage?.trim() || undefined,
    };
  }
}
