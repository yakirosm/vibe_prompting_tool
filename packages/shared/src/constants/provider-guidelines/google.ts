import type { ProviderGuideline } from '../../types/guidelines';

export const GOOGLE_GUIDELINES: ProviderGuideline = {
  id: 'google',
  name: 'Google (Gemini)',
  documentationUrl: 'https://ai.google.dev/gemini-api/docs/prompting-intro',

  principles: [
    'Be specific about the task',
    'Provide context about the domain',
    'Specify the output format clearly',
    'Use examples for few-shot learning',
    'Iterate and refine prompts',
    'Ground responses with reference material',
  ],

  structureRules: [
    'Use clear section headers',
    'Provide input/output examples',
    'Specify constraints explicitly',
    'Use markdown for formatting',
  ],

  avoid: [
    'Vague or open-ended prompts',
    'Missing context about the domain',
    'Unclear output expectations',
    'Over-reliance on single prompts',
  ],

  promptPatterns: [
    'Task-focused: "Your task is to..."',
    'Few-shot examples: "Here are some examples..."',
    'Format specification: "Return the result as..."',
    'Grounding: "Based on the following context..."',
  ],

  promptInjection: `Follow Google/Gemini best practices:
- Be task-focused and specific
- Provide relevant context
- Specify output format clearly`,

  version: '2024-01',
};
