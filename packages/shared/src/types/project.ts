import type { PromptMode, AgentId } from './prompt';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  stackSummary?: string;
  contextPack?: string;
  dodChecklist?: string[];
  defaultMode?: PromptMode;
  defaultAgent?: AgentId;
  constraintsPreset?: ConstraintsPreset;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConstraintsPreset {
  noBreakingChanges?: boolean;
  keepTestsGreen?: boolean;
  minimalDiff?: boolean;
  followExistingPatterns?: boolean;
  addTests?: boolean;
  addDocumentation?: boolean;
  accessibilityRequired?: boolean;
  i18nRequired?: boolean;
  customConstraints?: string[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  stackSummary?: string;
  contextPack?: string;
  dodChecklist?: string[];
  defaultMode?: PromptMode;
  defaultAgent?: AgentId;
  constraintsPreset?: ConstraintsPreset;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  id: string;
}
