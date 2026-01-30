'use client';

import * as React from 'react';
import { AGENT_OPTIONS, type AgentId, type CustomAgent } from '@prompt-ops/shared';

interface AgentOption {
  value: AgentId;
  label: string;
  isCustom?: boolean;
}

interface UseAgentOptionsReturn {
  allAgentOptions: AgentOption[];
  customAgents: CustomAgent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAgentOptions(): UseAgentOptionsReturn {
  const [customAgents, setCustomAgents] = React.useState<CustomAgent[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCustomAgents = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/agents?activeOnly=true');
      if (!response.ok) {
        // If unauthorized or not configured, just return empty array
        if (response.status === 401 || response.status === 503) {
          setCustomAgents([]);
          return;
        }
        throw new Error('Failed to fetch custom agents');
      }
      const data = await response.json();
      setCustomAgents(data.agents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load custom agents');
      setCustomAgents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCustomAgents();
  }, [fetchCustomAgents]);

  const allAgentOptions = React.useMemo<AgentOption[]>(() => {
    // Filter out the generic 'custom' option from built-in options
    const builtInOptions = AGENT_OPTIONS
      .filter((opt) => opt.value !== 'custom')
      .map((opt) => ({
        value: opt.value as AgentId,
        label: opt.label,
        isCustom: false,
      }));

    // Add custom agents
    const customOptions = customAgents.map((agent) => ({
      value: `custom-${agent.id}` as AgentId,
      label: agent.name,
      isCustom: true,
    }));

    return [...builtInOptions, ...customOptions];
  }, [customAgents]);

  return {
    allAgentOptions,
    customAgents,
    isLoading,
    error,
    refetch: fetchCustomAgents,
  };
}
