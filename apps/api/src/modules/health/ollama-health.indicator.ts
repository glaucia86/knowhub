import type { HealthOllamaStatus } from '@knowhub/shared-types';

export class OllamaHealthIndicator {
  async check(): Promise<HealthOllamaStatus> {
    try {
      const response = await fetch(
        `${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/tags`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(2_000),
        },
      );

      if (!response.ok) {
        return {
          status: 'unavailable',
        };
      }

      const payload = (await response.json()) as { models?: Array<{ name: string }> };
      return {
        status: 'available',
        models: (payload.models ?? []).map((item) => item.name),
      };
    } catch {
      return {
        status: 'unavailable',
      };
    }
  }
}
