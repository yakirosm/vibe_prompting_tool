import type { TweakDefinition, ThinkingLevel } from '../types/tweaks';

// ============================================================================
// SKILL TWEAKS
// ============================================================================

export const SKILL_TWEAKS: TweakDefinition[] = [
  {
    id: 'frontend-design',
    label: 'Frontend Design',
    description: 'UI/UX, accessibility, visual consistency',
    category: 'skill',
    instruction: `SKILL: Frontend Design
- Prioritize clean, accessible UI with proper ARIA labels
- Follow responsive design patterns
- Maintain visual consistency with existing components
- Consider keyboard navigation and screen readers
- Use semantic HTML elements`,
    tokenCost: 'low',
    triggerKeywords: ['ui', 'ux', 'design', 'component', 'button', 'form', 'layout', 'style', 'css', 'tailwind', 'accessibility', 'responsive', 'mobile'],
    relevantAgents: ['lovable', 'v0', 'bolt', 'cursor'],
    icon: '🎨',
  },
  {
    id: 'algorithmic-art',
    label: 'Algorithmic Art',
    description: 'Creative coding, canvas/SVG, generative art',
    category: 'skill',
    instruction: `SKILL: Algorithmic Art
- Use seeded randomness for reproducible results
- Leverage canvas or SVG for rendering
- Consider frame rate and performance for animations
- Implement parameter tweaking for exploration
- Apply mathematical patterns (noise, fractals, etc.)`,
    tokenCost: 'low',
    triggerKeywords: ['art', 'generative', 'canvas', 'svg', 'animation', 'visual', 'creative', 'p5', 'three.js', 'webgl', 'particles', 'fractal'],
    relevantAgents: ['v0', 'bolt', 'replit'],
    icon: '✨',
  },
  {
    id: 'mcp-builder',
    label: 'MCP Builder',
    description: 'Model Context Protocol servers and tools',
    category: 'skill',
    instruction: `SKILL: MCP Builder
- Follow MCP protocol specifications
- Design clear tool schemas with descriptions
- Handle errors gracefully with informative messages
- Implement proper authentication if needed
- Consider rate limiting and caching`,
    tokenCost: 'low',
    triggerKeywords: ['mcp', 'model context protocol', 'tool', 'server', 'integration', 'api', 'claude', 'assistant'],
    relevantAgents: ['claude-code', 'cursor', 'aider'],
    icon: '🔌',
  },
  {
    id: 'webapp-testing',
    label: 'Web App Testing',
    description: 'E2E, unit, and component testing',
    category: 'skill',
    instruction: `SKILL: Web App Testing
- Write tests that are maintainable and readable
- Use appropriate testing levels (unit, integration, E2E)
- Mock external dependencies properly
- Cover edge cases and error scenarios
- Follow testing best practices (AAA pattern, etc.)`,
    tokenCost: 'low',
    triggerKeywords: ['test', 'testing', 'jest', 'vitest', 'playwright', 'cypress', 'e2e', 'unit', 'component', 'mock', 'coverage'],
    relevantAgents: ['cursor', 'claude-code', 'windsurf'],
    icon: '🧪',
  },
  {
    id: 'api-design',
    label: 'API Design',
    description: 'REST/GraphQL best practices',
    category: 'skill',
    instruction: `SKILL: API Design
- Follow RESTful conventions for endpoints
- Use proper HTTP methods and status codes
- Design consistent error response formats
- Implement proper validation and sanitization
- Consider versioning and backwards compatibility`,
    tokenCost: 'low',
    triggerKeywords: ['api', 'rest', 'graphql', 'endpoint', 'route', 'http', 'request', 'response', 'fetch', 'server'],
    relevantAgents: ['cursor', 'claude-code', 'codex', 'windsurf'],
    icon: '🖥️',
  },
  {
    id: 'database-design',
    label: 'Database Design',
    description: 'Schema, queries, migrations',
    category: 'skill',
    instruction: `SKILL: Database Design
- Design normalized schemas with proper relationships
- Write efficient queries with appropriate indexes
- Use migrations for schema changes
- Consider data integrity constraints
- Plan for scalability and performance`,
    tokenCost: 'low',
    triggerKeywords: ['database', 'db', 'sql', 'schema', 'migration', 'query', 'table', 'index', 'postgres', 'mysql', 'supabase', 'prisma'],
    relevantAgents: ['cursor', 'claude-code', 'codex'],
    icon: '🗄️',
  },
];

// ============================================================================
// THINKING MODE TWEAKS
// ============================================================================

export const THINKING_TWEAKS: TweakDefinition[] = [
  {
    id: 'think',
    label: 'Think',
    description: 'Extended thinking for complex problems',
    category: 'thinking',
    instruction: `THINKING MODE: Extended
Before implementing, take time to:
- Understand the full scope of the request
- Consider potential edge cases
- Plan the implementation approach
- Identify any dependencies or prerequisites`,
    tokenCost: 'medium',
    triggerKeywords: ['complex', 'tricky', 'careful', 'think', 'architecture', 'design pattern'],
    icon: '🧠',
  },
  {
    id: 'think-harder',
    label: 'Think Harder',
    description: 'Deep analysis for challenging problems',
    category: 'thinking',
    instruction: `THINKING MODE: Deep Analysis
Engage in thorough analysis:
- Break down the problem into components
- Evaluate multiple solution approaches
- Consider trade-offs for each approach
- Anticipate potential issues and mitigations
- Document your reasoning process`,
    tokenCost: 'high',
    triggerKeywords: ['hard', 'difficult', 'challenging', 'complex architecture', 'refactor', 'redesign', 'optimize'],
    icon: '🧠',
  },
  {
    id: 'ultrathink',
    label: 'Ultrathink',
    description: 'Maximum reasoning for critical problems',
    category: 'thinking',
    instruction: `THINKING MODE: Maximum Reasoning
Apply comprehensive analysis:
- Exhaustively explore the problem space
- Consider all possible approaches and their trade-offs
- Think through every edge case and failure mode
- Plan for testing and validation at each step
- Document assumptions and decision rationale
- Consider long-term maintainability and scalability`,
    tokenCost: 'very-high',
    triggerKeywords: ['critical', 'mission critical', 'production', 'scale', 'enterprise', 'security critical'],
    icon: '⚛️',
  },
];

// ============================================================================
// BEHAVIOR TWEAKS
// ============================================================================

export const BEHAVIOR_TWEAKS: TweakDefinition[] = [
  {
    id: 'ask-questions',
    label: 'Ask Questions',
    description: 'Clarify requirements before implementing',
    category: 'behavior',
    instruction: `BEHAVIOR: Ask Clarifying Questions
Before implementing, identify and ask about:
- Ambiguous requirements
- Missing context or specifications
- Design preferences and constraints
- Expected behavior in edge cases`,
    tokenCost: 'low',
    triggerKeywords: ['unclear', 'ambiguous', 'not sure', 'maybe', 'possibly', 'options'],
    conflictsWith: ['minimize-changes'],
    icon: '❓',
  },
  {
    id: 'be-thorough',
    label: 'Be Thorough',
    description: 'Comprehensive with all edge cases',
    category: 'behavior',
    instruction: `BEHAVIOR: Be Thorough
Provide comprehensive implementation:
- Handle all edge cases explicitly
- Include error handling for every operation
- Add input validation where appropriate
- Consider accessibility and internationalization
- Document complex logic`,
    tokenCost: 'medium',
    triggerKeywords: ['thorough', 'complete', 'comprehensive', 'full', 'all cases', 'edge case'],
    conflictsWith: ['minimize-changes'],
    icon: '✓✓',
  },
  {
    id: 'minimize-changes',
    label: 'Minimize Changes',
    description: 'Smallest possible change',
    category: 'behavior',
    instruction: `BEHAVIOR: Minimize Changes
Keep the implementation minimal:
- Make the smallest change that solves the problem
- Avoid refactoring unrelated code
- Don't add features not explicitly requested
- Prefer simple solutions over clever ones
- Keep the diff as small as possible`,
    tokenCost: 'low',
    triggerKeywords: ['minimal', 'small', 'simple', 'just', 'only', 'quick fix', 'hotfix'],
    conflictsWith: ['be-thorough'],
    icon: '⊖',
  },
  {
    id: 'explain-reasoning',
    label: 'Explain Reasoning',
    description: 'Include design decision explanations',
    category: 'behavior',
    instruction: `BEHAVIOR: Explain Reasoning
Document your thought process:
- Explain why specific approaches were chosen
- Note trade-offs that were considered
- Describe alternatives that were rejected and why
- Document any assumptions made`,
    tokenCost: 'medium',
    triggerKeywords: ['explain', 'why', 'reason', 'understand', 'learn', 'teach'],
    icon: '💬',
  },
  {
    id: 'security-focus',
    label: 'Security Focus',
    description: 'Prioritize security considerations',
    category: 'behavior',
    instruction: `BEHAVIOR: Security Focus
Prioritize security in implementation:
- Validate and sanitize all inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization checks
- Avoid exposing sensitive information
- Follow OWASP security guidelines`,
    tokenCost: 'low',
    triggerKeywords: ['security', 'secure', 'auth', 'authentication', 'authorization', 'permission', 'xss', 'sql injection', 'csrf'],
    icon: '🛡️',
  },
  {
    id: 'performance-focus',
    label: 'Performance Focus',
    description: 'Optimize for speed and efficiency',
    category: 'behavior',
    instruction: `BEHAVIOR: Performance Focus
Optimize for performance:
- Minimize unnecessary computations
- Use appropriate data structures
- Consider caching strategies
- Avoid N+1 query problems
- Profile and measure before optimizing`,
    tokenCost: 'low',
    triggerKeywords: ['performance', 'fast', 'speed', 'optimize', 'efficient', 'slow', 'lag', 'bottleneck'],
    icon: '⚡',
  },
];

// ============================================================================
// ALL TWEAKS
// ============================================================================

export const ALL_TWEAKS: TweakDefinition[] = [
  ...SKILL_TWEAKS,
  ...THINKING_TWEAKS,
  ...BEHAVIOR_TWEAKS,
];

export const TWEAKS_BY_ID: Record<string, TweakDefinition> = Object.fromEntries(
  ALL_TWEAKS.map((tweak) => [tweak.id, tweak])
);

export const THINKING_LEVELS: ThinkingLevel[] = ['think', 'think-harder', 'ultrathink'];

export function getTweakById(id: string): TweakDefinition | undefined {
  return TWEAKS_BY_ID[id];
}

export function getTweaksByCategory(category: TweakDefinition['category']): TweakDefinition[] {
  return ALL_TWEAKS.filter((tweak) => tweak.category === category);
}

export function isThinkingTweak(id: string): id is ThinkingLevel {
  return THINKING_LEVELS.includes(id as ThinkingLevel);
}
