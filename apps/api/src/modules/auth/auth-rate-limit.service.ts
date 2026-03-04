import { HttpException, HttpStatus } from '@nestjs/common';

interface BucketState {
  startedAt: number;
  count: number;
}

export class AuthRateLimitService {
  private readonly buckets = new Map<string, BucketState>();
  private readonly windowMs = 60_000;
  private readonly limit = 10;

  checkAndConsume(ip: string): void {
    const now = Date.now();
    const key = ip || 'unknown';
    const current = this.buckets.get(key);

    if (!current || now - current.startedAt >= this.windowMs) {
      this.buckets.set(key, { startedAt: now, count: 1 });
      return;
    }

    if (current.count >= this.limit) {
      throw new HttpException(
        'Too many attempts. Please wait 60 seconds.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    current.count += 1;
    this.buckets.set(key, current);
  }
}
