import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAIProvider } from '@/lib/ai/provider-interface';
import { buildMessages, parseGeneratedPrompt } from '@/lib/ai/prompt-builder';
import {
  type PromptGenerationOptions,
  type AIProviderType,
  type CustomAgent,
  validatePromptGenerationOptions,
  DEFAULT_MODELS,
  isCustomAgentId,
  extractCustomAgentUuid,
} from '@prompt-ops/shared';

interface UserSettings {
  ai_provider: string | null;
  ai_api_key_encrypted: string | null;
  ai_model: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const options: PromptGenerationOptions = {
      input: body.input,
      agent: body.agent,
      length: body.length,
      strategy: body.strategy,
      askClarifyingQuestions: body.askClarifyingQuestions ?? false,
      projectContext: body.projectContext,
    };

    // Validate input
    const validation = validatePromptGenerationOptions(options);
    if (!validation.valid) {
      return NextResponse.json(
        { message: validation.errors[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    // Get user settings (if authenticated)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let provider: AIProviderType = 'openai';
    let apiKey: string | undefined;
    let model: string = DEFAULT_MODELS.openai;

    if (user) {
      const { data } = await supabase
        .from('user_settings')
        .select('ai_provider, ai_api_key_encrypted, ai_model')
        .eq('id', user.id)
        .single();

      const settings = data as UserSettings | null;

      if (settings?.ai_provider) {
        provider = settings.ai_provider as AIProviderType;
      }
      if (settings?.ai_model) {
        model = settings.ai_model;
      }
      if (settings?.ai_api_key_encrypted) {
        // In production, decrypt the API key here
        apiKey = settings.ai_api_key_encrypted;
      }
    }

    // Use environment variable as fallback
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
      if (process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
        provider = 'anthropic';
        model = DEFAULT_MODELS.anthropic;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { message: 'No API key configured. Please add your API key in settings.' },
        { status: 400 }
      );
    }

    // Fetch custom agent if needed
    let customAgent: CustomAgent | undefined;
    if (isCustomAgentId(options.agent)) {
      const customAgentId = extractCustomAgentUuid(options.agent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: agentData, error: agentError } = await (supabase as any)
        .from('custom_agents')
        .select('*')
        .eq('id', customAgentId)
        .single();

      if (agentError || !agentData) {
        return NextResponse.json(
          { message: 'Custom agent not found' },
          { status: 404 }
        );
      }
      customAgent = agentData as CustomAgent;
    }

    // Build messages
    const messages = buildMessages(options, { provider, customAgent });

    // Create AI provider and generate
    const aiProvider = createAIProvider({
      provider,
      apiKey,
      model,
    });

    const response = await aiProvider.complete({
      messages,
      maxTokens: 2048,
      temperature: 0.7,
    });

    // Parse the response
    const prompt = parseGeneratedPrompt(response.content);

    return NextResponse.json({
      prompt,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}
