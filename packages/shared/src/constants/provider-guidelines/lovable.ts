import type { ProviderGuideline } from '../../types/guidelines';

export const LOVABLE_GUIDELINES: ProviderGuideline = {
  id: 'lovable',
  name: 'Lovable',

  principles: [
    'Focus on user experience',
    'Match existing UI patterns',
    'Follow the design system',
    'Consider responsive behavior',
    'Maintain visual consistency',
    'Think about accessibility',
  ],

  structureRules: [
    'Describe UI changes in user terms',
    'Reference existing components',
    'Specify responsive behavior',
    'Include interaction states',
  ],

  avoid: [
    'Inconsistent styling',
    'Breaking the design system',
    'Ignoring mobile viewports',
    'Forgetting loading/error states',
  ],

  promptPatterns: [
    'User story: "As a user, I want to..."',
    'UI reference: "Similar to the existing..."',
    'Design system: "Using the design system components..."',
    'Responsive: "On mobile, this should..."',
  ],

  promptInjection: `For Lovable:
- Focus on user experience and UI consistency
- Match the existing design system and patterns
- Consider responsive behavior across viewports
- Include loading, error, and empty states`,

  version: '2024-01',
};
