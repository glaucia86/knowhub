import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

type RequestUrlGuard = (url: string) => Promise<void>;

@Injectable()
export class PlaywrightService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlaywrightService.name);
  private browser: import('playwright').Browser | null = null;

  async onModuleInit(): Promise<void> {
    try {
      const { chromium } = await import('playwright');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.logger.log('Playwright browser has started.');
    } catch {
      this.logger.warn(
        'Playwright unavailable (optionalDependency). UrlLoader will use fallback fetch+readability.',
      );
      this.browser = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  isAvailable(): boolean {
    return this.browser !== null;
  }

  async fetchHtml(url: string, timeoutMs = 15000, guard?: RequestUrlGuard): Promise<string> {
    if (!this.browser) {
      throw new Error('Playwright not available');
    }

    const ensureAllowed = async (candidateUrl: string): Promise<void> => {
      const { protocol } = new URL(candidateUrl);
      if (protocol !== 'http:' && protocol !== 'https:') {
        throw new Error(`Unsupported URL protocol: ${protocol}`);
      }

      if (guard) {
        await guard(candidateUrl);
      }
    };

    await ensureAllowed(url);

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; KnowHubBot/1.3; +https://github.com/knowhub)',
    });
    await context.route('**/*', async (route) => {
      try {
        await ensureAllowed(route.request().url());
        await route.continue();
      } catch {
        await route.abort('accessdenied');
      }
    });

    const page = await context.newPage();
    try {
      await page.goto(url, { timeout: timeoutMs, waitUntil: 'networkidle' });
      await ensureAllowed(page.url());
      return await page.content();
    } finally {
      await context.close();
    }
  }
}
