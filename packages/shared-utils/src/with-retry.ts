export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onlyOnNetworkErrors?: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isRetryableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('econnreset') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('socket')
  );
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  const shouldRetry =
    options.shouldRetry ??
    ((error: unknown) => {
      if (options.onlyOnNetworkErrors) {
        return isRetryableNetworkError(error);
      }
      return true;
    });

  let currentAttempt = 0;
  let lastError: unknown;

  while (currentAttempt < maxAttempts) {
    currentAttempt += 1;
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (currentAttempt >= maxAttempts || !shouldRetry(error, currentAttempt)) {
        throw error;
      }
      await delay(baseDelayMs * 2 ** (currentAttempt - 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Retry failed');
}
