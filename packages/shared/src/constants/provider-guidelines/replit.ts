import type { ProviderGuideline } from '../../types/guidelines';

export const REPLIT_GUIDELINES: ProviderGuideline = {
  id: 'replit',
  name: 'Replit',

  principles: [
    'Include setup instructions',
    'Explain how to run the code',
    'Provide verification steps',
    'Be beginner-friendly',
    'Consider the environment',
    'Document dependencies',
  ],

  structureRules: [
    'Start with environment setup',
    'Include run commands',
    'Add verification steps',
    'Explain in accessible terms',
  ],

  avoid: [
    'Assuming prior knowledge',
    'Skipping setup steps',
    'Missing run instructions',
    'Complex jargon without explanation',
  ],

  promptPatterns: [
    'Setup: "First, install..."',
    'Verification: "To test this, run..."',
    'Step-by-step: "1. Create... 2. Add... 3. Run..."',
    'Environment: "This requires Node.js..."',
  ],

  promptInjection: `For Replit:
- Include clear setup and run instructions
- Explain how to verify the changes work
- Be beginner-friendly in explanations
- Document any required dependencies or environment setup`,

  version: '2024-01',
};
