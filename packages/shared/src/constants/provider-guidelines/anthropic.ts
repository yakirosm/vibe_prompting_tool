import type { ProviderGuideline } from '../../types/guidelines';

export const ANTHROPIC_GUIDELINES: ProviderGuideline = {
  id: 'anthropic',
  name: 'Anthropic (Claude)',
  documentationUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering',

  principles: [
    'Be clear and direct in instructions',
    'Use XML tags for structured input/output',
    'Assign a role or persona when helpful',
    'Use chain-of-thought for complex reasoning',
    'Provide examples for consistent formatting',
    'Let Claude think before answering for complex tasks',
    'Break complex tasks into subtasks',
  ],

  structureRules: [
    'Use XML tags like <context>, <instructions>, <output>',
    'Place examples in <example> tags',
    'Use <thinking> tags for intermediate reasoning',
    'Structure long documents with clear sections',
  ],

  avoid: [
    'Overly complex single prompts',
    'Ambiguous instructions without examples',
    'Skipping the "thinking" step for complex logic',
    'Mixing instructions with content',
  ],

  promptPatterns: [
    'XML structure: <context>...</context>',
    'Role assignment: "You are an expert..."',
    'Chain of thought: "Think through this step by step in <thinking> tags"',
    'Prefilling: Start the assistant response to guide format',
  ],

  promptInjection: `Follow Anthropic/Claude best practices:
- Use XML tags to structure the prompt
- Be direct and specific
- For complex tasks, encourage step-by-step thinking`,

  version: '2024-01',
};
