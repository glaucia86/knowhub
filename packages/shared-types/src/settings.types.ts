export type AIProvider = 'ollama' | 'azure';
export type PrivacyMode = 'local' | 'hybrid';

export interface EmbeddingCompatibilityWarning {
  affected: number;
  currentModel: string;
  newModel: string;
}

export interface SettingsResponse {
  id: string;
  userId: string;
  displayName: string;
  preferredLanguage: string;
  privacyMode: PrivacyMode;
  aiProvider: AIProvider;
  aiModel: string;
  embeddingModel: string;
  telegramEnabled: boolean;
  embeddingCompatibilityWarning?: EmbeddingCompatibilityWarning;
}

export interface UpdateSettingsRequest {
  displayName?: string;
  preferredLanguage?: string;
  privacyMode?: PrivacyMode;
  aiProvider?: AIProvider;
  aiModel?: string;
  embeddingModel?: string;
  telegramEnabled?: boolean;
}

export interface AIModelInfo {
  name: string;
  size: string;
  quantization: string;
  family: string;
}

export interface TestAiResponse {
  ok: boolean;
  modelName: string;
  latencyMs: number;
  error?: string;
}
