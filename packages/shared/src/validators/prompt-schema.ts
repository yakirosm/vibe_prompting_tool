import type { PromptGenerationOptions, PromptLength, PromptStrategy, BuiltInAgentId, SelectedTweaks } from '../types/prompt';
import { isCustomAgentId } from '../types/prompt';
import type { ThinkingLevel } from '../types/tweaks';
import { ALL_TWEAKS, THINKING_LEVELS, getTweakById } from '../constants/tweaks';
import { tweaksConflict } from '../utils/tweak-suggestions';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export const VALID_LENGTHS: PromptLength[] = ['short', 'standard', 'detailed'];
export const VALID_STRATEGIES: PromptStrategy[] = ['implement', 'diagnose'];
export const VALID_BUILT_IN_AGENTS: BuiltInAgentId[] = [
  'cursor',
  'lovable',
  'replit',
  'codex',
  'claude-code',
  'windsurf',
  'bolt',
  'v0',
  'aider',
  'generic',
  'custom',
];

function isValidAgent(agent: string): boolean {
  return VALID_BUILT_IN_AGENTS.includes(agent as BuiltInAgentId) || isCustomAgentId(agent);
}

export const INPUT_MAX_LENGTH = 5000;
export const INPUT_MIN_LENGTH = 10;

export function validatePromptInput(input: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || input.trim().length === 0) {
    errors.push({ field: 'input', message: 'Input is required' });
  } else if (input.length < INPUT_MIN_LENGTH) {
    errors.push({
      field: 'input',
      message: `Input must be at least ${INPUT_MIN_LENGTH} characters`,
    });
  } else if (input.length > INPUT_MAX_LENGTH) {
    errors.push({
      field: 'input',
      message: `Input must not exceed ${INPUT_MAX_LENGTH} characters`,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validatePromptGenerationOptions(
  options: Partial<PromptGenerationOptions>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate input
  const inputValidation = validatePromptInput(options.input || '');
  errors.push(...inputValidation.errors);

  // Validate agent
  if (!options.agent) {
    errors.push({ field: 'agent', message: 'Agent is required' });
  } else if (!isValidAgent(options.agent)) {
    errors.push({ field: 'agent', message: 'Invalid agent selected' });
  }

  // Validate length
  if (!options.length) {
    errors.push({ field: 'length', message: 'Length is required' });
  } else if (!VALID_LENGTHS.includes(options.length)) {
    errors.push({ field: 'length', message: 'Invalid length selected' });
  }

  // Validate strategy
  if (!options.strategy) {
    errors.push({ field: 'strategy', message: 'Strategy is required' });
  } else if (!VALID_STRATEGIES.includes(options.strategy)) {
    errors.push({ field: 'strategy', message: 'Invalid strategy selected' });
  }

  // Validate tweaks if provided
  if (options.tweaks) {
    const tweaksValidation = validateSelectedTweaks(options.tweaks);
    errors.push(...tweaksValidation.errors);
  }

  return { valid: errors.length === 0, errors };
}

export function validateSelectedTweaks(tweaks: SelectedTweaks): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate skill tweaks
  if (tweaks.skills && tweaks.skills.length > 0) {
    for (const skillId of tweaks.skills) {
      const tweak = getTweakById(skillId);
      if (!tweak) {
        errors.push({ field: 'tweaks.skills', message: `Invalid skill tweak: ${skillId}` });
      } else if (tweak.category !== 'skill') {
        errors.push({ field: 'tweaks.skills', message: `${skillId} is not a skill tweak` });
      }
    }
  }

  // Validate thinking mode
  if (tweaks.thinking) {
    if (!THINKING_LEVELS.includes(tweaks.thinking as ThinkingLevel)) {
      errors.push({ field: 'tweaks.thinking', message: `Invalid thinking mode: ${tweaks.thinking}` });
    }
  }

  // Validate behavior tweaks
  if (tweaks.behaviors && tweaks.behaviors.length > 0) {
    for (const behaviorId of tweaks.behaviors) {
      const tweak = getTweakById(behaviorId);
      if (!tweak) {
        errors.push({ field: 'tweaks.behaviors', message: `Invalid behavior tweak: ${behaviorId}` });
      } else if (tweak.category !== 'behavior') {
        errors.push({ field: 'tweaks.behaviors', message: `${behaviorId} is not a behavior tweak` });
      }
    }

    // Check for conflicts between behaviors
    for (let i = 0; i < tweaks.behaviors.length; i++) {
      for (let j = i + 1; j < tweaks.behaviors.length; j++) {
        if (tweaksConflict(tweaks.behaviors[i], tweaks.behaviors[j])) {
          const tweakA = getTweakById(tweaks.behaviors[i]);
          const tweakB = getTweakById(tweaks.behaviors[j]);
          errors.push({
            field: 'tweaks.behaviors',
            message: `Conflicting behaviors: "${tweakA?.label}" and "${tweakB?.label}"`,
          });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export interface LinterSuggestion {
  type: 'warning' | 'info';
  message: string;
  field?: string;
  autoFix?: string;
}

export function lintPromptInput(input: string): LinterSuggestion[] {
  const suggestions: LinterSuggestion[] = [];

  // Check for vague language
  const vagueTerms = ['improve', 'fix', 'make better', 'enhance', 'optimize'];
  const lowerInput = input.toLowerCase();

  for (const term of vagueTerms) {
    if (lowerInput.includes(term) && !lowerInput.includes('how to')) {
      suggestions.push({
        type: 'warning',
        message: `Consider being more specific than "${term}". What exactly should change?`,
      });
      break; // Only show one vague term warning
    }
  }

  // Check for missing expected behavior
  const hasExpected =
    lowerInput.includes('should') ||
    lowerInput.includes('expected') ||
    lowerInput.includes('want') ||
    lowerInput.includes('need');

  if (!hasExpected && input.length > 50) {
    suggestions.push({
      type: 'info',
      message: 'Consider adding what the expected behavior should be',
      field: 'expected',
    });
  }

  // Check for missing context
  if (input.length < 100 && !lowerInput.includes('context') && !lowerInput.includes('using')) {
    suggestions.push({
      type: 'info',
      message: 'Adding tech stack or project context can improve results',
      field: 'context',
    });
  }

  return suggestions;
}
