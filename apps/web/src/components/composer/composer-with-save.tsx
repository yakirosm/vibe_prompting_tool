'use client';

import * as React from 'react';
import { Composer } from './composer';
import type { GeneratedPrompt, AgentId, PromptLength, PromptStrategy } from '@prompt-ops/shared';

interface SavePromptData {
  input: string;
  agent: AgentId;
  length: PromptLength;
  strategy: PromptStrategy;
  generatedPrompt: GeneratedPrompt;
}

interface ComposerWithSaveProps {
  isAuthenticated: boolean;
}

export function ComposerWithSave({ isAuthenticated }: ComposerWithSaveProps) {
  const handleSave = React.useCallback(async (data: SavePromptData) => {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save prompt');
    }

    return response.json();
  }, []);

  return (
    <Composer
      isAuthenticated={isAuthenticated}
      onSave={isAuthenticated ? handleSave : undefined}
    />
  );
}
