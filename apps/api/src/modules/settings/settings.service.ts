import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import type {
  AIModelInfo,
  EmbeddingCompatibilityWarning,
  SettingsResponse,
  TestAiResponse,
} from '@knowhub/shared-types';
import { and, eq, ne, sql } from 'drizzle-orm';
import { getDatabaseClient } from '../../db/database.client';
import { contentChunks, userSettings, users } from '../../db/schema';
import { AIProviderFactory } from './ai-provider.factory';
import { UpdateSettingsDto } from './dto/settings.dto';
import { OllamaModelsService } from './ollama-models.service';

@Injectable()
export class SettingsService {
  private readonly db = getDatabaseClient().db;

  constructor(
    private readonly aiProviderFactory: AIProviderFactory,
    private readonly ollamaModelsService: OllamaModelsService,
  ) {}

  private async resolveDefaultUser(): Promise<{ id: string; name: string }> {
    const rows = await this.db.select({ id: users.id, name: users.name }).from(users).limit(1);
    if (rows.length === 0) {
      throw new NotFoundException('Default user not found');
    }
    return rows[0];
  }

  private async resolveSettings(userId: string) {
    const rows = await this.db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    if (rows.length === 0) {
      throw new NotFoundException('Settings not found');
    }
    return rows[0];
  }

  private mapSettingsResponse(
    user: { id: string; name: string },
    settings: typeof userSettings.$inferSelect,
  ): SettingsResponse {
    return {
      id: settings.id,
      userId: user.id,
      displayName: user.name,
      preferredLanguage: settings.language,
      privacyMode: settings.privacyMode ? 'local' : 'hybrid',
      aiProvider: settings.aiProvider as 'ollama' | 'azure',
      aiModel: settings.aiModel,
      embeddingModel: settings.embeddingModel,
      telegramEnabled: settings.telegramEnabled,
    };
  }

  async getSettings(): Promise<SettingsResponse> {
    const user = await this.resolveDefaultUser();
    const settings = await this.resolveSettings(user.id);
    return this.mapSettingsResponse(user, settings);
  }

  async updateSettings(payload: UpdateSettingsDto): Promise<SettingsResponse> {
    const user = await this.resolveDefaultUser();
    const current = await this.resolveSettings(user.id);

    const nextProvider = payload.aiProvider ?? (current.aiProvider as 'ollama' | 'azure');
    const nextModel = payload.aiModel ?? current.aiModel;
    const nextEmbeddingModel = payload.embeddingModel ?? current.embeddingModel;

    if (
      nextProvider === 'azure' &&
      (!process.env.EXTERNAL_AI_API_KEY || !process.env.EXTERNAL_AI_BASE_URL)
    ) {
      throw new BadRequestException(
        'Switching to Azure requires EXTERNAL_AI_API_KEY and EXTERNAL_AI_BASE_URL to be configured.',
      );
    }

    if (payload.displayName) {
      await this.db
        .update(users)
        .set({ name: payload.displayName, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    await this.db
      .update(userSettings)
      .set({
        aiProvider: nextProvider,
        aiModel: nextModel,
        embeddingModel: nextEmbeddingModel,
        language: payload.preferredLanguage ?? current.language,
        privacyMode: payload.privacyMode ? payload.privacyMode === 'local' : current.privacyMode,
        telegramEnabled: payload.telegramEnabled ?? current.telegramEnabled,
      })
      .where(eq(userSettings.id, current.id));

    const updatedUser = await this.resolveDefaultUser();
    const updatedSettings = await this.resolveSettings(updatedUser.id);
    const response = this.mapSettingsResponse(updatedUser, updatedSettings);

    if (current.embeddingModel !== nextEmbeddingModel) {
      const affectedRows = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(contentChunks)
        .where(
          and(
            sql`${contentChunks.embeddingModel} IS NOT NULL`,
            ne(contentChunks.embeddingModel, nextEmbeddingModel),
          ),
        );

      const warning: EmbeddingCompatibilityWarning = {
        affected: Number(affectedRows[0]?.count ?? 0),
        currentModel: current.embeddingModel,
        newModel: nextEmbeddingModel,
      };
      response.embeddingCompatibilityWarning = warning;
    }

    return response;
  }

  async testAI(): Promise<TestAiResponse> {
    const settings = await this.getSettings();
    const provider = this.aiProviderFactory.getProvider(settings.aiProvider);
    return provider.testConnection(settings.aiModel);
  }

  async listAIModels(): Promise<{ local: AIModelInfo[]; cloud: string[] }> {
    const local = await this.ollamaModelsService.listModels();
    return {
      local,
      cloud: ['gpt-5.1', 'gpt-4.1-mini'],
    };
  }
}
