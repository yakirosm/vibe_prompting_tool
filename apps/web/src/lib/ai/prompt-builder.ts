import type {
  PromptGenerationOptions,
  GeneratedPrompt,
  AIMessage,
  AIProviderType,
  CustomAgent,
  BuiltInAgentId,
} from '@prompt-ops/shared';
import {
  CORE_SYSTEM_PROMPT,
  LENGTH_INSTRUCTIONS,
  STRATEGY_INSTRUCTIONS,
  CLARIFYING_QUESTIONS_INSTRUCTION,
  getAgentDialectPrompt,
  getCustomAgentDialectPrompt,
  lookupGuidelines,
  detectInputLanguage,
  isCustomAgentId,
} from '@prompt-ops/shared';

export interface PromptBuilderConfig {
  provider: AIProviderType;
  customAgent?: CustomAgent;
}

export function buildSystemPrompt(
  options: PromptGenerationOptions,
  config: PromptBuilderConfig
): string {
  const parts: string[] = [];

  // Core system prompt
  parts.push(CORE_SYSTEM_PROMPT);

  // Determine if this is a custom agent
  const isCustom = isCustomAgentId(options.agent);

  // Add guidelines injection (only for built-in agents)
  if (!isCustom) {
    const guidelines = lookupGuidelines(config.provider, options.agent as BuiltInAgentId);
    if (guidelines.combinedInjection) {
      parts.push('\n---\nGUIDELINES:\n' + guidelines.combinedInjection);
    }
  }

  // Add agent dialect
  if (isCustom && config.customAgent) {
    parts.push('\n---\n' + getCustomAgentDialectPrompt(config.customAgent));
  } else if (!isCustom) {
    parts.push('\n---\n' + getAgentDialectPrompt(options.agent as BuiltInAgentId));
  }

  // Add length instructions
  parts.push('\n---\n' + LENGTH_INSTRUCTIONS[options.length]);

  // Add strategy instructions
  parts.push('\n---\n' + STRATEGY_INSTRUCTIONS[options.strategy]);

  // Add clarifying questions instruction if enabled
  if (options.askClarifyingQuestions) {
    parts.push('\n---\n' + CLARIFYING_QUESTIONS_INSTRUCTION);
  }

  // Add project context if available
  if (options.projectContext) {
    parts.push(`\n---\nPROJECT CONTEXT:\n${options.projectContext}`);
  }

  return parts.join('\n');
}

export function buildMessages(
  options: PromptGenerationOptions,
  config: PromptBuilderConfig
): AIMessage[] {
  const systemPrompt = buildSystemPrompt(options, config);
  const inputLanguage = detectInputLanguage(options.input);

  let userContent = options.input;

  // Add language note if Hebrew detected
  if (inputLanguage === 'he') {
    userContent = `[Input is in Hebrew - translate to English]\n\n${options.input}`;
  }

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}

export function parseGeneratedPrompt(rawOutput: string): GeneratedPrompt {
  const lines = rawOutput.split('\n');
  const result: GeneratedPrompt = {
    goal: '',
    acceptanceCriteria: [],
    fullPrompt: rawOutput,
  };

  let currentSection: string | null = null;
  let currentContent: string[] = [];

  const sectionPatterns: Record<string, RegExp> = {
    goal: /^\*?\*?Goal\*?\*?:/i,
    context: /^\*?\*?Context\*?\*?:/i,
    currentBehavior: /^\*?\*?Current( behavior)?( \(BROKEN\))?\*?\*?:/i,
    currentIssues: /^\*?\*?(Current )?Issues?\*?\*?:/i,
    expectedBehavior: /^\*?\*?Expected( behavior)?\*?\*?:/i,
    acceptanceCriteria: /^\*?\*?Acceptance (criteria|Criteria)\*?\*?:/i,
    constraints: /^\*?\*?Constraints?\*?\*?:/i,
    clarifyingQuestions: /^\*?\*?(Questions?|Clarifying questions?)\*?\*?:/i,
  };

  for (const line of lines) {
    let matchedSection: string | null = null;

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(line)) {
        matchedSection = section;
        break;
      }
    }

    if (matchedSection) {
      // Save previous section
      if (currentSection) {
        saveSectionContent(result, currentSection, currentContent);
      }
      currentSection = matchedSection;
      // Extract content after the colon
      const colonIndex = line.indexOf(':');
      const afterColon = colonIndex >= 0 ? line.slice(colonIndex + 1).trim() : '';
      currentContent = afterColon ? [afterColon] : [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection) {
    saveSectionContent(result, currentSection, currentContent);
  }

  return result;
}

function saveSectionContent(
  result: GeneratedPrompt,
  section: string,
  content: string[]
): void {
  // Clean up content - remove leading ** or * artifacts from AI output
  const cleanedContent = content
    .map(line => line.replace(/^\*+\s*/, '').trim())
    .filter(line => line.length > 0);
  const joinedContent = cleanedContent.join('\n').trim();

  switch (section) {
    case 'goal':
      result.goal = joinedContent;
      break;
    case 'context':
      result.context = joinedContent;
      break;
    case 'currentBehavior':
    case 'currentIssues':
      // Merge into currentBehavior - preserve issue list format
      result.currentBehavior = result.currentBehavior
        ? result.currentBehavior + '\n' + joinedContent
        : joinedContent;
      break;
    case 'expectedBehavior':
      result.expectedBehavior = joinedContent;
      break;
    case 'acceptanceCriteria':
      result.acceptanceCriteria = extractBulletPoints(content);
      break;
    case 'constraints':
      result.constraints = extractBulletPoints(content);
      break;
    case 'clarifyingQuestions':
      result.clarifyingQuestions = extractBulletPoints(content);
      break;
  }
}

function extractBulletPoints(lines: string[]): string[] {
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip lines that are just asterisks or formatting artifacts
    if (/^\*+$/.test(trimmed) || trimmed === '') continue;

    // Match lines starting with -, *, •, or numbers
    const bulletMatch = trimmed.match(/^[-*•]|\d+\./);
    if (bulletMatch) {
      // Remove bullet prefix and any leading asterisks
      const content = trimmed
        .replace(/^[-*•]\s*|\d+\.\s*/, '')
        .replace(/^\*+\s*/, '')
        .trim();
      if (content && content !== '*') {
        bullets.push(content);
      }
    }
  }

  return bullets;
}

export function formatPromptForCopy(prompt: GeneratedPrompt): string {
  const sections: string[] = [];

  if (prompt.goal) {
    sections.push(`**Goal:** ${prompt.goal}`);
  }

  if (prompt.context) {
    sections.push(`**Context:** ${prompt.context}`);
  }

  if (prompt.currentBehavior) {
    sections.push(`**Current behavior (BROKEN):**\n${prompt.currentBehavior}`);
  }

  if (prompt.expectedBehavior) {
    sections.push(`**Expected behavior:** ${prompt.expectedBehavior}`);
  }

  if (prompt.acceptanceCriteria.length > 0) {
    sections.push(`**Acceptance criteria:**\n${prompt.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}`);
  }

  if (prompt.constraints && prompt.constraints.length > 0) {
    sections.push(`**Constraints:**\n${prompt.constraints.map((c) => `- ${c}`).join('\n')}`);
  }

  if (prompt.clarifyingQuestions && prompt.clarifyingQuestions.length > 0) {
    sections.push(`**Questions:**\n${prompt.clarifyingQuestions.map((q) => `- ${q}`).join('\n')}`);
  }

  return sections.join('\n\n');
}
