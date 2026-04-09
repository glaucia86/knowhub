export interface SetupOllamaCheckResult {
  available: boolean;
  message: string;
}

export class SetupOllamaCheckService {
  async check(): Promise<SetupOllamaCheckResult> {
    try {
      const response = await fetch(process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434', {
        method: 'HEAD',
        signal: AbortSignal.timeout(3_000),
      });
      if (response.ok) {
        return { available: true, message: 'Ollama detectado e disponivel.' };
      }
      return { available: false, message: `Ollama respondeu com status ${response.status}.` };
    } catch {
      return {
        available: false,
        message: 'Ollama nao detectado. O sistema continuara em operacao degradada.',
      };
    }
  }
}
