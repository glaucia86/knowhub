import { Injectable, Logger } from '@nestjs/common';
import type { AuthAuditEventType } from '@knowhub/shared-types';

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger(AuthAuditService.name);

  async record(
    eventType: AuthAuditEventType,
    userId: string | null,
    clientId: string | null,
    metadata?: Record<string, string>,
  ): Promise<void> {
    const payload = {
      eventType,
      userId,
      clientId,
      metadata,
      occurredAt: new Date().toISOString(),
    };
    this.logger.log(JSON.stringify(payload));
  }
}
