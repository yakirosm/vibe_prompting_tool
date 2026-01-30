'use client';

import * as React from 'react';
import Link from 'next/link';
import { HelpCircle, Bot, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type PromptLength, type PromptStrategy, type AgentId } from '@prompt-ops/shared';
import { useAgentOptions } from '@/hooks/use-agent-options';
import { cn } from '@/lib/utils';

interface OptionsBarProps {
  agent: AgentId;
  length: PromptLength;
  strategy: PromptStrategy;
  askClarifyingQuestions: boolean;
  onAgentChange: (agent: AgentId) => void;
  onLengthChange: (length: PromptLength) => void;
  onStrategyChange: (strategy: PromptStrategy) => void;
  onAskClarifyingQuestionsChange: (value: boolean) => void;
  disabled?: boolean;
}

export function OptionsBar({
  agent,
  length,
  strategy,
  askClarifyingQuestions,
  onAgentChange,
  onLengthChange,
  onStrategyChange,
  onAskClarifyingQuestionsChange,
  disabled,
}: OptionsBarProps) {
  const { allAgentOptions } = useAgentOptions();

  // Separate built-in and custom agents
  const builtInAgents = allAgentOptions.filter((opt) => !opt.isCustom);
  const customAgents = allAgentOptions.filter((opt) => opt.isCustom);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30 transition-colors">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Agent Selector */}
        <div className="space-y-2">
          <Label htmlFor="agent-select" className="text-sm font-medium">
            Target Agent
          </Label>
          <Select
            value={agent}
            onValueChange={(value) => onAgentChange(value as AgentId)}
            disabled={disabled}
          >
            <SelectTrigger id="agent-select" className="transition-colors">
              <SelectValue placeholder="Select agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Built-in Agents</SelectLabel>
                {builtInAgents.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
              {customAgents.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Custom Agents</SelectLabel>
                    {customAgents.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Bot className="h-3 w-3 text-primary" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
              <SelectSeparator />
              <div className="px-2 py-1.5">
                <Link
                  href="/app/agents"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Settings2 className="h-3 w-3" />
                  Manage Agents
                </Link>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Length Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Output Length</Label>
          <ToggleGroup
            type="single"
            value={length}
            onValueChange={(value) => {
              if (value) onLengthChange(value as PromptLength);
            }}
            disabled={disabled}
            className="justify-start"
          >
            <ToggleGroupItem value="short" aria-label="Short" className="text-xs transition-all">
              Short
            </ToggleGroupItem>
            <ToggleGroupItem value="standard" aria-label="Standard" className="text-xs transition-all">
              Standard
            </ToggleGroupItem>
            <ToggleGroupItem value="detailed" aria-label="Detailed" className="text-xs transition-all">
              Detailed
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Strategy Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Strategy</Label>
          <ToggleGroup
            type="single"
            value={strategy}
            onValueChange={(value) => {
              if (value) onStrategyChange(value as PromptStrategy);
            }}
            disabled={disabled}
            className="justify-start"
          >
            <ToggleGroupItem value="implement" aria-label="Implement" className="text-xs transition-all">
              Implement
            </ToggleGroupItem>
            <ToggleGroupItem value="diagnose" aria-label="Diagnose" className="text-xs transition-all">
              Diagnose
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Clarifying Questions Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label className="text-sm font-medium">Questions Mode</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">
                    When enabled, the generated prompt will include 2-4 clarifying questions to help the AI better understand your needs before implementing.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-md transition-all',
              askClarifyingQuestions && 'bg-primary/10 border border-primary/20'
            )}
          >
            <Switch
              id="clarifying-questions"
              checked={askClarifyingQuestions}
              onCheckedChange={onAskClarifyingQuestionsChange}
              disabled={disabled}
            />
            <Label
              htmlFor="clarifying-questions"
              className={cn(
                'text-sm cursor-pointer transition-colors',
                askClarifyingQuestions && 'text-primary font-medium'
              )}
            >
              Include clarifying questions
            </Label>
            {askClarifyingQuestions && (
              <Badge variant="secondary" className="text-xs animate-fade-in">
                ON
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
