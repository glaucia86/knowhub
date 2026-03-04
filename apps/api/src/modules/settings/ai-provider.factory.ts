import type { TestAiResponse } from '@knowhub/shared-types';

export interface AIProviderStrategy {
  testConnection(modelName: string): Promise<TestAiResponse>;
}

class OllamaStrategy implements AIProviderStrategy {
  async testConnection(modelName: string): Promise<TestAiResponse> {
    const startedAt = Date.now();
    try {
      const response = await fetch(
        `${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/api/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            prompt: 'Responda apenas: OK',
            stream: false,
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );

      return {
        ok: response.ok,
        modelName,
        latencyMs: Date.now() - startedAt,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        modelName,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Ollama unavailable',
      };
    }
  }
}

class AzureStrategy implements AIProviderStrategy {
  async testConnection(modelName: string): Promise<TestAiResponse> {
    const startedAt = Date.now();
    const apiKey = process.env.EXTERNAL_AI_API_KEY;
    const endpoint = process.env.EXTERNAL_AI_BASE_URL;

    if (!apiKey || !endpoint) {
      return {
        ok: false,
        modelName,
        latencyMs: Date.now() - startedAt,
        error: 'Provider azure requer EXTERNAL_AI_API_KEY e EXTERNAL_AI_BASE_URL',
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(30_000),
      });

      return {
        ok: response.ok,
        modelName,
        latencyMs: Date.now() - startedAt,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        modelName,
        latencyMs: Date.now() - startedAt,
        error: error instanceof Error ? error.message : 'Azure unavailable',
      };
    }
  }
}

export class AIProviderFactory {
  private readonly ollamaStrategy = new OllamaStrategy();
  private readonly azureStrategy = new AzureStrategy();

  getProvider(provider: 'ollama' | 'azure'): AIProviderStrategy {
    if (provider === 'azure') {
      return this.azureStrategy;
    }
    return this.ollamaStrategy;
  }
}
