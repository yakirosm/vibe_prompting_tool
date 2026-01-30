export type PromptMode = 'quick' | 'smart-form' | 'wizard' | 'pro';
export type PromptLength = 'short' | 'standard' | 'detailed';
export type PromptStrategy = 'implement' | 'diagnose';
export type InputLanguage = 'he' | 'en';

export interface ExtractedFields {
  problem?: string;
  expected?: string;
  scope?: string;
  area?: string;
  constraints?: string[];
}

export interface Prompt {
  id: string;
  userId: string;
  projectId?: string;
  agentProfileId: string;
  templateId?: string;
  modeUsed: PromptMode;
  inputRaw: string;
  inputLanguage: InputLanguage;
  extractedFields?: ExtractedFields;
  outputPrompt: string;
  variantType: PromptLength;
  strategy: PromptStrategy;
  contextInjected?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptOutcome {
  id: string;
  promptId: string;
  worked: boolean;
  rating?: number;
  notes?: string;
  createdAt: Date;
}

export interface PromptGenerationOptions {
  input: string;
  agent: AgentId;
  length: PromptLength;
  strategy: PromptStrategy;
  askClarifyingQuestions: boolean;
  projectContext?: string;
}

export interface GeneratedPrompt {
  goal: string;
  context?: string;
  currentBehavior?: string;
  expectedBehavior?: string;
  acceptanceCriteria: string[];
  constraints?: string[];
  clarifyingQuestions?: string[];
  fullPrompt: string;
}

export type BuiltInAgentId =
  | 'cursor'
  | 'lovable'
  | 'replit'
  | 'codex'
  | 'claude-code'
  | 'windsurf'
  | 'bolt'
  | 'v0'
  | 'aider'
  | 'generic'
  | 'custom';

export type CustomAgentId = `custom-${string}`;

export type AgentId = BuiltInAgentId | CustomAgentId;

export function isCustomAgentId(agentId: string): agentId is CustomAgentId {
  return agentId.startsWith('custom-') && agentId !== 'custom';
}

export function extractCustomAgentUuid(agentId: CustomAgentId): string {
  return agentId.replace('custom-', '');
}
