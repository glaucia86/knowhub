import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

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

  async fetchHtml(url: string, timeoutMs = 15000): Promise<string> {
    if (!this.browser) {
      throw new Error('Playwright not available');
    }

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (compatible; KnowHubBot/1.3; +https://github.com/knowhub)',
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { timeout: timeoutMs, waitUntil: 'networkidle' });
      return await page.content();
    } finally {
      await context.close();
    }
  }
}
