import type { ProviderGuideline } from '../../types/guidelines';

export const OPENAI_GUIDELINES: ProviderGuideline = {
  id: 'openai',
  name: 'OpenAI',
  documentationUrl: 'https://platform.openai.com/docs/guides/prompt-engineering',

  principles: [
    'Write clear, specific instructions',
    'Provide reference text when possible',
    'Split complex tasks into simpler subtasks',
    'Give the model time to think (step-by-step)',
    'Use delimiters to clearly indicate distinct parts',
    'Specify the desired output format',
    'Provide examples (few-shot prompting)',
  ],

  structureRules: [
    'Use markdown for structure',
    'Use code blocks for code examples',
    'Number steps for sequential tasks',
    'Use bullet points for lists',
  ],

  avoid: [
    'Vague or ambiguous instructions',
    'Asking what NOT to do (instead say what TO do)',
    'Overly long context without clear purpose',
    'Mixing multiple unrelated tasks',
  ],

  promptPatterns: [
    'Role assignment: "You are a..."',
    'Chain of thought: "Think step by step"',
    'Output format specification: "Respond in JSON format..."',
    'Few-shot examples for consistent output',
  ],

  promptInjection: `Follow OpenAI best practices:
- Be specific and clear in instructions
- Use delimiters for distinct sections
- Specify output format explicitly`,

  version: '2024-01',
};
