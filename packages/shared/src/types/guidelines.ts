export type GuidelineProviderId = 'openai' | 'anthropic' | 'google' | 'cursor' | 'lovable' | 'replit';

export interface ProviderGuideline {
  id: GuidelineProviderId;
  name: string;
  documentationUrl?: string;
  principles: string[];
  structureRules: string[];
  avoid: string[];
  promptPatterns: string[];
  promptInjection?: string;
  lastReviewedAt?: Date;
  version?: string;
}

export interface GuidelinesLookupResult {
  provider: ProviderGuideline;
  agent?: ProviderGuideline;
  combinedInjection: string;
}
