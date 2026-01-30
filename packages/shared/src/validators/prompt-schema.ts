import type { PromptGenerationOptions, PromptLength, PromptStrategy, AgentId } from '../types/prompt';

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
export const VALID_AGENTS: AgentId[] = [
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
  } else if (!VALID_AGENTS.includes(options.agent)) {
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
