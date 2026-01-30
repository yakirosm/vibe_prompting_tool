import type { BuiltInAgentId } from './prompt';

export type TweakCategory = 'skill' | 'thinking' | 'behavior';
export type ThinkingLevel = 'think' | 'think-harder' | 'ultrathink';
export type TokenCostLevel = 'low' | 'medium' | 'high' | 'very-high';

export interface TweakDefinition {
  id: string;
  label: string;
  description: string;
  category: TweakCategory;
  instruction: string;
  tokenCost: TokenCostLevel;
  triggerKeywords?: string[];
  relevantAgents?: BuiltInAgentId[];
  conflictsWith?: string[];
  icon?: string;
}

export interface SelectedTweaks {
  skills: string[];
  thinking?: ThinkingLevel;
  behaviors: string[];
}

export interface TweakSuggestion {
  tweakId: string;
  confidence: number;
  reason: string;
}

export const TOKEN_COST_LABELS: Record<TokenCostLevel, string> = {
  low: '+10-20%',
  medium: '+30-50%',
  high: '+100-150%',
  'very-high': '+200%+',
};

export const TOKEN_COST_COLORS: Record<TokenCostLevel, string> = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  high: 'text-orange-600 dark:text-orange-400',
  'very-high': 'text-red-600 dark:text-red-400',
};
