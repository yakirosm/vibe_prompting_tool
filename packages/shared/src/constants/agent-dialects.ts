import type { AgentId } from '../types/prompt';

export interface AgentDialect {
  id: AgentId;
  name: string;
  tone: string;
  structure: string;
  emphasis: string;
  extraPhrase: string;
  outputFormatNotes?: string;
}

export const AGENT_DIALECTS: Record<AgentId, AgentDialect> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    tone: 'Technical, minimal',
    structure: 'Files → Changes',
    emphasis: 'Diff size, tests',
    extraPhrase: 'Keep changes minimal and focused. Reference specific file paths.',
    outputFormatNotes: 'Include file paths when relevant. Prefer small, atomic changes.',
  },
  lovable: {
    id: 'lovable',
    name: 'Lovable',
    tone: 'UX-focused',
    structure: 'User story → UI',
    emphasis: 'Design consistency',
    extraPhrase: 'Match the existing UI patterns and design system.',
    outputFormatNotes: 'Focus on user experience and visual consistency.',
  },
  replit: {
    id: 'replit',
    name: 'Replit',
    tone: 'Beginner-friendly',
    structure: 'Setup → Verify',
    emphasis: 'Environment',
    extraPhrase: 'Include how to run and verify the changes.',
    outputFormatNotes: 'Explain environment setup and verification steps.',
  },
  codex: {
    id: 'codex',
    name: 'Codex',
    tone: 'Methodical',
    structure: 'Steps 1, 2, 3',
    emphasis: 'Order of operations',
    extraPhrase: 'First... then... finally...',
    outputFormatNotes: 'Use numbered steps and explicit ordering.',
  },
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    tone: 'Thoughtful, comprehensive',
    structure: 'Context → Plan → Execute',
    emphasis: 'Understanding before action',
    extraPhrase: 'Think step-by-step before implementing. Understand the full context first.',
    outputFormatNotes: 'Provide reasoning, then implementation. Consider edge cases.',
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    tone: 'Collaborative, iterative',
    structure: 'Issue → Solution → Verify',
    emphasis: 'Multi-file changes',
    extraPhrase: 'Consider related files that may need updates. Work across the codebase.',
    outputFormatNotes: 'Identify all affected files upfront. Include verification steps.',
  },
  bolt: {
    id: 'bolt',
    name: 'Bolt',
    tone: 'Fast, practical',
    structure: 'Goal → Implementation',
    emphasis: 'Working code quickly',
    extraPhrase: 'Focus on getting it working quickly. Iterate from there.',
    outputFormatNotes: 'Prioritize functional code. Keep it simple and direct.',
  },
  v0: {
    id: 'v0',
    name: 'v0',
    tone: 'UI-focused, component-driven',
    structure: 'Component → Styling → Integration',
    emphasis: 'Clean, reusable components',
    extraPhrase: 'Generate clean, reusable UI components with modern patterns.',
    outputFormatNotes: 'Use React/Next.js patterns. Include Tailwind CSS styling.',
  },
  aider: {
    id: 'aider',
    name: 'Aider',
    tone: 'Git-aware, diff-focused',
    structure: 'Changes → Commit',
    emphasis: 'Precise code changes',
    extraPhrase: 'Show precise code changes. Be ready to commit.',
    outputFormatNotes: 'Format changes as diffs when possible. Keep commits atomic.',
  },
  generic: {
    id: 'generic',
    name: 'Generic (Any Agent)',
    tone: 'Neutral, adaptable',
    structure: 'Problem → Solution → Criteria',
    emphasis: 'Clarity and completeness',
    extraPhrase: 'Format for any AI coding assistant. Be clear and complete.',
    outputFormatNotes: 'Universal format that works with any AI tool.',
  },
  custom: {
    id: 'custom',
    name: 'Custom Agent',
    tone: 'User-defined',
    structure: 'User-defined',
    emphasis: 'User-defined',
    extraPhrase: 'Follow the custom instructions provided.',
    outputFormatNotes: 'Apply user-defined preferences and guidelines.',
  },
};

export const AGENT_OPTIONS = Object.values(AGENT_DIALECTS).map((dialect) => ({
  value: dialect.id,
  label: dialect.name,
}));

export function getAgentDialect(agentId: AgentId): AgentDialect {
  return AGENT_DIALECTS[agentId];
}

export function getAgentDialectPrompt(agentId: AgentId): string {
  const dialect = AGENT_DIALECTS[agentId];
  return `
AGENT: ${dialect.name}
- Tone: ${dialect.tone}
- Structure preference: ${dialect.structure}
- Emphasis: ${dialect.emphasis}
- Key instruction: ${dialect.extraPhrase}
${dialect.outputFormatNotes ? `- Output notes: ${dialect.outputFormatNotes}` : ''}
`.trim();
}
