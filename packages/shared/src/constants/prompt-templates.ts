import type { PromptLength, PromptStrategy } from '../types/prompt';

export interface PromptTemplate {
  id: string;
  name: string;
  type: 'bug' | 'feature' | 'refactor' | 'performance' | 'tests' | 'general';
  description: string;
  baseStructure: string;
  placeholders: string[];
  isSystem: boolean;
}

export const CORE_SYSTEM_PROMPT = `You are a prompt engineering assistant that transforms amateur development requests into professional, agent-ready prompts.

INPUT: A user's description of a coding task (may be in Hebrew or English)
OUTPUT: A structured English prompt optimized for AI coding assistants

CRITICAL RULES:
1. Always output in English, regardless of input language
2. PRESERVE ALL PROBLEMS - If the user lists bugs, issues, or things that need fixing, you MUST include EVERY SINGLE ONE in the "Current behavior (BROKEN)" section. Count them - if user lists 6 issues, output must have 6 issues.
3. For bug reports or issues:
   - The "Current behavior (BROKEN)" section MUST list ALL issues from the input
   - Number each issue: "- Issue 1:", "- Issue 2:", etc.
   - Describe what is BROKEN/WRONG for each item
   - Then show "Expected behavior" describing the FIX for each issue
4. Be specific and actionable - replace vague words with concrete descriptions
5. Include acceptance criteria as bullet points (one per issue minimum)
6. The goal should reflect the task type: "Fix..." for bugs, "Implement..." for features

FORMATTING RULES:
- Use clean markdown: **Bold:** for headers
- Do NOT add extra asterisks or formatting characters
- Lists should use "- " prefix only
- Keep output clean and parseable

IMPORTANT: If user provides 6 issues, your "Current behavior (BROKEN)" section MUST have 6 items. Missing issues = failed output.`;

export const LENGTH_INSTRUCTIONS: Record<PromptLength, string> = {
  short: `LENGTH: Short
- Goal statement (1 sentence) - use "Fix..." for bugs, "Implement..." for features
- If bugs/issues are mentioned: Brief "Current issues:" list with ALL issues
- 2-4 acceptance criteria bullets only`,

  standard: `LENGTH: Standard
Use this EXACT structure (no extra asterisks or formatting):

**Goal:** [One sentence - "Fix X issues..." or "Implement X features..."]

**Current behavior (BROKEN):**
[REQUIRED for bug reports - List EVERY issue from user input]
- Issue 1: [First problem - what's wrong]
- Issue 2: [Second problem - what's wrong]
- Issue 3: [Third problem - what's wrong]
[Continue for ALL issues mentioned by user]

**Expected behavior:**
- Issue 1: [What it should do instead]
- Issue 2: [What it should do instead]
[Match each issue above]

**Acceptance criteria:**
- [Testable condition for issue 1]
- [Testable condition for issue 2]
[One criterion per issue minimum]

**Constraints:**
- [Any limitations mentioned by user]`,

  detailed: `LENGTH: Detailed
Use the standard structure with EXTRA DETAIL:

**Goal:** [Comprehensive goal statement]

**Context:** [Project/tech context if provided]

**Current behavior (BROKEN):**
[List ALL issues - if user mentions 6 problems, list 6 problems]
- Issue 1: [Detailed description of what's broken]
- Issue 2: [Detailed description of what's broken]
[Continue for EVERY issue]

**Expected behavior:**
[Detailed fix for each issue]

**Acceptance criteria:**
[5-8 bullet points with specific test conditions]

**Constraints:**
[Any limitations]

**Edge cases:**
[Potential edge cases]

**Test scenarios:**
[How to verify each fix]`,
};

export const STRATEGY_INSTRUCTIONS: Record<PromptStrategy, string> = {
  implement: `STRATEGY: Implement
- Assume reasonable defaults for missing details
- Proceed with a minimal, safe implementation
- Focus on getting working code quickly
- Don't ask questions unless absolutely blocked`,

  diagnose: `STRATEGY: Diagnose
- Before implementing, analyze the root cause
- Request confirmation steps to verify understanding
- Identify potential issues before coding
- Ask 2-4 clarifying questions if the problem is unclear`,
};

export const CLARIFYING_QUESTIONS_INSTRUCTION = `
IMPORTANT: You MUST include a "**Questions:**" section at the end of your response with 2-4 targeted clarifying questions.

This is MANDATORY - always include questions even if the input seems complete. Questions should:
- Ask about expected behavior or edge cases
- Clarify design preferences for UI changes
- Identify potential integration points or dependencies
- Verify assumptions about the tech stack or constraints

Format:
**Questions:**
- [Question 1]
- [Question 2]
- [Question 3]`;

export const SYSTEM_TEMPLATES: PromptTemplate[] = [
  {
    id: 'bug-fix',
    name: 'Bug Fix',
    type: 'bug',
    description: 'Template for reporting and fixing bugs',
    baseStructure: `**Goal:** Fix the bug where {problem}
**Current behavior:** {current}
**Expected behavior:** {expected}
**Steps to reproduce:** {steps}
**Acceptance criteria:**
- Bug no longer occurs
- Existing tests pass
- No regressions introduced`,
    placeholders: ['problem', 'current', 'expected', 'steps'],
    isSystem: true,
  },
  {
    id: 'new-feature',
    name: 'New Feature',
    type: 'feature',
    description: 'Template for implementing new features',
    baseStructure: `**Goal:** Implement {feature}
**Context:** {context}
**User story:** As a {user}, I want to {action} so that {benefit}
**Acceptance criteria:**
- {criteria}
**Constraints:**
- Follow existing code patterns
- Include unit tests`,
    placeholders: ['feature', 'context', 'user', 'action', 'benefit', 'criteria'],
    isSystem: true,
  },
  {
    id: 'refactor',
    name: 'Refactoring',
    type: 'refactor',
    description: 'Template for refactoring existing code',
    baseStructure: `**Goal:** Refactor {target} to {improvement}
**Current state:** {current}
**Desired state:** {desired}
**Acceptance criteria:**
- Functionality unchanged
- All tests pass
- Code is more {quality}
**Constraints:**
- No breaking changes
- Keep the PR reviewable (minimal diff)`,
    placeholders: ['target', 'improvement', 'current', 'desired', 'quality'],
    isSystem: true,
  },
  {
    id: 'performance',
    name: 'Performance',
    type: 'performance',
    description: 'Template for performance improvements',
    baseStructure: `**Goal:** Improve performance of {target}
**Current metrics:** {metrics}
**Target metrics:** {target_metrics}
**Suspected cause:** {cause}
**Acceptance criteria:**
- Measurable performance improvement
- No functionality regressions
- Include before/after benchmarks`,
    placeholders: ['target', 'metrics', 'target_metrics', 'cause'],
    isSystem: true,
  },
  {
    id: 'tests',
    name: 'Add Tests',
    type: 'tests',
    description: 'Template for adding test coverage',
    baseStructure: `**Goal:** Add test coverage for {target}
**Current coverage:** {current}
**Test scenarios:**
- {scenarios}
**Acceptance criteria:**
- All test scenarios covered
- Tests are readable and maintainable
- Edge cases included`,
    placeholders: ['target', 'current', 'scenarios'],
    isSystem: true,
  },
];

export function getSystemTemplate(type: PromptTemplate['type']): PromptTemplate | undefined {
  return SYSTEM_TEMPLATES.find((t) => t.type === type);
}
