'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { HelpCircle, Bot, Settings2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
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
  const t = useTranslations('composer.options');
  const tOutput = useTranslations('composer.output.tabs');
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
            {t('targetAgent')}
          </Label>
          <Select
            value={agent}
            onValueChange={(value) => onAgentChange(value as AgentId)}
            disabled={disabled}
          >
            <SelectTrigger id="agent-select" className="transition-colors">
              <SelectValue placeholder={t('selectAgent')} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{t('builtInAgents')}</SelectLabel>
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
                    <SelectLabel>{t('customAgents')}</SelectLabel>
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
                  {t('manageAgents')}
                </Link>
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Length Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('outputLength')}</Label>
          <ToggleGroup
            type="single"
            value={length}
            onValueChange={(value) => {
              if (value) onLengthChange(value as PromptLength);
            }}
            disabled={disabled}
            className="justify-start"
          >
            <ToggleGroupItem value="short" aria-label={tOutput('short')} className="text-xs transition-all">
              {tOutput('short')}
            </ToggleGroupItem>
            <ToggleGroupItem value="standard" aria-label={tOutput('standard')} className="text-xs transition-all">
              {tOutput('standard')}
            </ToggleGroupItem>
            <ToggleGroupItem value="detailed" aria-label={tOutput('detailed')} className="text-xs transition-all">
              {tOutput('detailed')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Strategy Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t('strategy')}</Label>
          <ToggleGroup
            type="single"
            value={strategy}
            onValueChange={(value) => {
              if (value) onStrategyChange(value as PromptStrategy);
            }}
            disabled={disabled}
            className="justify-start"
          >
            <ToggleGroupItem value="implement" aria-label={t('implement')} className="text-xs transition-all">
              {t('implement')}
            </ToggleGroupItem>
            <ToggleGroupItem value="diagnose" aria-label={t('diagnose')} className="text-xs transition-all">
              {t('diagnose')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Clarifying Questions Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label className="text-sm font-medium">{t('questionsMode')}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px]">
                  <p className="text-xs">
                    {t('clarifyingQuestionsTooltip')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ToggleGroup
            type="single"
            value={askClarifyingQuestions ? 'on' : 'off'}
            onValueChange={(value) => {
              if (value) onAskClarifyingQuestionsChange(value === 'on');
            }}
            disabled={disabled}
            className="justify-start"
          >
            <ToggleGroupItem
              value="off"
              aria-label={t('off')}
              className="text-xs transition-all"
            >
              {t('off')}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="on"
              aria-label={t('on')}
              className="text-xs transition-all"
            >
              {t('on')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
