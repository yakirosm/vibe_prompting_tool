import type {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
} from '@prompt-ops/shared';

export abstract class BaseAIProvider implements AIProvider {
  abstract name: AIProviderType;
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  protected getDefaultMaxTokens(): number {
    return this.config.maxTokens || 2048;
  }

  protected getDefaultTemperature(): number {
    return this.config.temperature ?? 0.7;
  }
}

export function createAIProvider(config: AIProviderConfig): AIProvider {
  // Dynamic import to avoid bundling all providers
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'groq':
      return new GroqProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

// OpenAI Provider
class OpenAIProvider extends BaseAIProvider {
  name: AIProviderType = 'openai';

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        max_tokens: request.maxTokens || this.getDefaultMaxTokens(),
        temperature: request.temperature ?? this.getDefaultTemperature(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      finishReason: choice.finish_reason === 'stop' ? 'stop' : 'length',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}

// Anthropic Provider
class AnthropicProvider extends BaseAIProvider {
  name: AIProviderType = 'anthropic';

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    // Extract system message
    const systemMessage = request.messages.find((m) => m.role === 'system');
    const otherMessages = request.messages.filter((m) => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: request.maxTokens || this.getDefaultMaxTokens(),
        system: systemMessage?.content,
        messages: otherMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API error');
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      finishReason: data.stop_reason === 'end_turn' ? 'stop' : 'length',
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  }
}

// Groq Provider (OpenAI-compatible)
class GroqProvider extends BaseAIProvider {
  name: AIProviderType = 'groq';

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        max_tokens: request.maxTokens || this.getDefaultMaxTokens(),
        temperature: request.temperature ?? this.getDefaultTemperature(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Groq API error');
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      finishReason: choice.finish_reason === 'stop' ? 'stop' : 'length',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
