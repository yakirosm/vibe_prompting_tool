import type { ProviderGuideline, GuidelinesLookupResult, GuidelineProviderId } from '../../types/guidelines';
import type { AIProviderType } from '../../types/ai-provider';
import type { BuiltInAgentId } from '../../types/prompt';
import { OPENAI_GUIDELINES } from './openai';
import { ANTHROPIC_GUIDELINES } from './anthropic';
import { GOOGLE_GUIDELINES } from './google';
import { CURSOR_GUIDELINES } from './cursor';
import { LOVABLE_GUIDELINES } from './lovable';
import { REPLIT_GUIDELINES } from './replit';

export const ALL_GUIDELINES: Record<GuidelineProviderId, ProviderGuideline> = {
  openai: OPENAI_GUIDELINES,
  anthropic: ANTHROPIC_GUIDELINES,
  google: GOOGLE_GUIDELINES,
  cursor: CURSOR_GUIDELINES,
  lovable: LOVABLE_GUIDELINES,
  replit: REPLIT_GUIDELINES,
};

const PROVIDER_TO_GUIDELINE: Record<AIProviderType, GuidelineProviderId | null> = {
  openai: 'openai',
  anthropic: 'anthropic',
  groq: null, // Uses general best practices
  ollama: null, // Uses general best practices
  custom: null, // Uses general best practices
};

const AGENT_TO_GUIDELINE: Record<BuiltInAgentId, GuidelineProviderId> = {
  cursor: 'cursor',
  lovable: 'lovable',
  replit: 'replit',
  codex: 'openai', // Codex uses OpenAI guidelines
  'claude-code': 'anthropic', // Claude Code uses Anthropic guidelines
  windsurf: 'openai', // Windsurf uses OpenAI-style guidelines
  bolt: 'openai', // Bolt uses OpenAI-style guidelines
  v0: 'openai', // v0 uses OpenAI-style guidelines
  aider: 'openai', // Aider uses OpenAI-style guidelines
  generic: 'openai', // Generic uses OpenAI as default
  custom: 'openai', // Custom defaults to OpenAI, can be overridden
};

export function lookupGuidelines(
  provider: AIProviderType,
  agent: BuiltInAgentId
): GuidelinesLookupResult {
  const providerGuidelineId = PROVIDER_TO_GUIDELINE[provider];
  const agentGuidelineId = AGENT_TO_GUIDELINE[agent];

  const providerGuideline = providerGuidelineId
    ? ALL_GUIDELINES[providerGuidelineId]
    : OPENAI_GUIDELINES; // Default to OpenAI guidelines

  const agentGuideline = ALL_GUIDELINES[agentGuidelineId];

  // Combine injections
  const injections: string[] = [];

  if (providerGuideline.promptInjection) {
    injections.push(providerGuideline.promptInjection);
  }

  // Only add agent injection if different from provider
  if (agentGuideline && agentGuideline.id !== providerGuideline.id && agentGuideline.promptInjection) {
    injections.push(agentGuideline.promptInjection);
  }

  return {
    provider: providerGuideline,
    agent: agentGuideline.id !== providerGuideline.id ? agentGuideline : undefined,
    combinedInjection: injections.join('\n\n'),
  };
}

export function getProviderGuideline(providerId: GuidelineProviderId): ProviderGuideline {
  return ALL_GUIDELINES[providerId];
}
