export type AIProviderType = 'openai' | 'anthropic' | 'groq' | 'ollama' | 'custom';

export interface AIProviderConfig {
  provider: AIProviderType;
  apiKey?: string;
  model: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionRequest {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  name: AIProviderType;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  streamComplete?(request: AICompletionRequest): AsyncGenerator<string, void, unknown>;
}

export interface UserAISettings {
  id: string;
  aiProvider: AIProviderType;
  aiApiKeyEncrypted?: string;
  aiModel: string;
  defaultMode: string;
  defaultAgent: string;
  theme: 'light' | 'dark' | 'system';
  tokenBudget: 'low' | 'medium' | 'high';
  linterStrictness: 'off' | 'soft' | 'strict';
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  groq: 'llama-3.3-70b-versatile',
  ollama: 'llama3.2',
  custom: '',
};

export const PROVIDER_LABELS: Record<AIProviderType, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  groq: 'Groq',
  ollama: 'Ollama (Local)',
  custom: 'Custom API',
};
