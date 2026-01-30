import type { ProviderGuideline } from '../../types/guidelines';

export const CURSOR_GUIDELINES: ProviderGuideline = {
  id: 'cursor',
  name: 'Cursor',

  principles: [
    'Reference specific file paths',
    'Keep changes minimal and focused',
    'Maintain test coverage',
    'Follow existing code patterns',
    'Use codebase context effectively',
    'Prefer small, atomic changes',
  ],

  structureRules: [
    'Mention affected files explicitly',
    'Describe changes in terms of diffs',
    'Reference existing code patterns',
    'Keep the scope narrow',
  ],

  avoid: [
    'Large, sweeping changes',
    'Breaking existing tests',
    'Ignoring existing patterns',
    'Vague file references',
  ],

  promptPatterns: [
    'File reference: "In src/components/Button.tsx..."',
    'Minimal change: "Make the smallest change needed to..."',
    'Pattern following: "Following the pattern in..."',
    'Test awareness: "Ensure existing tests pass"',
  ],

  promptInjection: `For Cursor:
- Reference specific file paths when relevant
- Keep changes minimal and focused
- Follow existing code patterns in the codebase
- Ensure tests remain green`,

  version: '2024-01',
};
