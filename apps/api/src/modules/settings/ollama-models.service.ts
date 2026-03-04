import type { AIModelInfo } from '@knowhub/shared-types';

interface CacheEntry {
  data: AIModelInfo[];
  expiresAt: number;
}

export class OllamaModelsService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly ttlMs = 60_000;

  async listModels(
    baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
  ): Promise<AIModelInfo[]> {
    const now = Date.now();
    const cached = this.cache.get(baseUrl);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2_000),
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as {
        models?: Array<{
          name: string;
          size?: number;
          details?: { family?: string; quantization_level?: string };
        }>;
      };

      const data = (payload.models ?? []).map((item) => ({
        name: item.name,
        size: item.size ? `${item.size}` : 'unknown',
        quantization: item.details?.quantization_level ?? 'unknown',
        family: item.details?.family ?? 'unknown',
      }));

      this.cache.set(baseUrl, {
        data,
        expiresAt: now + this.ttlMs,
      });

      return data;
    } catch {
      return [];
    }
  }
}
