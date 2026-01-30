'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  type SelectedTweaks,
  type TweakSuggestion,
  type ThinkingLevel,
  type TweakDefinition,
  SKILL_TWEAKS,
  THINKING_TWEAKS,
  BEHAVIOR_TWEAKS,
  TOKEN_COST_LABELS,
  TOKEN_COST_COLORS,
  getTweakById,
  tweaksConflict,
  getConflictingTweaks,
  estimateTokenImpact,
} from '@prompt-ops/shared';

interface TweaksSelectorProps {
  selectedTweaks: SelectedTweaks;
  suggestions: TweakSuggestion[];
  onTweaksChange: (tweaks: SelectedTweaks) => void;
  disabled?: boolean;
}

export function TweaksSelector({
  selectedTweaks,
  suggestions,
  onTweaksChange,
  disabled,
}: TweaksSelectorProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Calculate active count
  const activeCount =
    selectedTweaks.skills.length +
    (selectedTweaks.thinking ? 1 : 0) +
    selectedTweaks.behaviors.length;

  // Get suggested tweak IDs
  const suggestedIds = React.useMemo(
    () => new Set(suggestions.map((s) => s.tweakId)),
    [suggestions]
  );

  // Handle skill toggle
  const handleSkillToggle = React.useCallback(
    (skillId: string) => {
      const newSkills = selectedTweaks.skills.includes(skillId)
        ? selectedTweaks.skills.filter((id) => id !== skillId)
        : [...selectedTweaks.skills, skillId];
      onTweaksChange({ ...selectedTweaks, skills: newSkills });
    },
    [selectedTweaks, onTweaksChange]
  );

  // Handle thinking mode change (single select)
  const handleThinkingChange = React.useCallback(
    (thinkingId: string) => {
      const newThinking =
        selectedTweaks.thinking === thinkingId ? undefined : (thinkingId as ThinkingLevel);
      onTweaksChange({ ...selectedTweaks, thinking: newThinking });
    },
    [selectedTweaks, onTweaksChange]
  );

  // Handle behavior toggle with conflict resolution
  const handleBehaviorToggle = React.useCallback(
    (behaviorId: string) => {
      if (selectedTweaks.behaviors.includes(behaviorId)) {
        // Removing - just remove it
        const newBehaviors = selectedTweaks.behaviors.filter((id) => id !== behaviorId);
        onTweaksChange({ ...selectedTweaks, behaviors: newBehaviors });
      } else {
        // Adding - remove conflicts first
        const conflicts = getConflictingTweaks(behaviorId);
        const newBehaviors = selectedTweaks.behaviors.filter((id) => !conflicts.includes(id));
        newBehaviors.push(behaviorId);
        onTweaksChange({ ...selectedTweaks, behaviors: newBehaviors });
      }
    },
    [selectedTweaks, onTweaksChange]
  );

  // Render a single tweak button
  const renderTweakButton = React.useCallback(
    (
      tweak: TweakDefinition,
      isSelected: boolean,
      onToggle: (id: string) => void,
      isSuggested: boolean
    ) => {
      const isDisabledByConflict =
        tweak.category === 'behavior' &&
        !isSelected &&
        selectedTweaks.behaviors.some((id) => tweaksConflict(id, tweak.id));

      return (
        <TooltipProvider key={tweak.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Toggle
                  pressed={isSelected}
                  onPressedChange={() => onToggle(tweak.id)}
                  disabled={disabled || isDisabledByConflict}
                  size="sm"
                  variant="outline"
                  className={cn(
                    'gap-1.5 text-xs transition-all',
                    isSelected && 'bg-primary/10 border-primary/40 text-primary',
                    isSuggested &&
                      !isSelected &&
                      'ring-2 ring-amber-400/50 ring-offset-1 animate-pulse',
                    isDisabledByConflict && 'opacity-40'
                  )}
                >
                  {tweak.icon && <span className="text-sm">{tweak.icon}</span>}
                  <span>{tweak.label}</span>
                  {isSuggested && !isSelected && (
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  )}
                </Toggle>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px]">
              <div className="space-y-1.5">
                <p className="font-medium">{tweak.label}</p>
                <p className="text-xs text-muted-foreground">{tweak.description}</p>
                <p className={cn('text-xs font-mono', TOKEN_COST_COLORS[tweak.tokenCost])}>
                  Token cost: {TOKEN_COST_LABELS[tweak.tokenCost]}
                </p>
                {isDisabledByConflict && (
                  <p className="text-xs text-destructive">
                    Conflicts with selected behavior
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    [disabled, selectedTweaks.behaviors]
  );

  // Get active tweaks for collapsed view
  const activeTweaks = React.useMemo(() => {
    const tweaks: TweakDefinition[] = [];
    if (selectedTweaks.thinking) {
      const t = getTweakById(selectedTweaks.thinking);
      if (t) tweaks.push(t);
    }
    for (const skillId of selectedTweaks.skills) {
      const t = getTweakById(skillId);
      if (t) tweaks.push(t);
    }
    for (const behaviorId of selectedTweaks.behaviors) {
      const t = getTweakById(behaviorId);
      if (t) tweaks.push(t);
    }
    return tweaks;
  }, [selectedTweaks]);

  // Token impact estimate
  const tokenImpact = React.useMemo(
    () =>
      estimateTokenImpact(
        [...selectedTweaks.skills, ...selectedTweaks.behaviors],
        selectedTweaks.thinking
      ),
    [selectedTweaks]
  );

  return (
    <div className="border rounded-lg bg-muted/30 transition-colors overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between p-4 text-left transition-colors',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Prompt Tweaks</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount} active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && tokenImpact !== 'No additional cost' && (
            <span className="text-xs text-muted-foreground">{tokenImpact}</span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Collapsed: Show suggestions banner and active tweaks */}
      {!isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* AI Suggestions Banner */}
          {suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>
                {suggestions.length} suggested tweak{suggestions.length !== 1 && 's'} based on your
                input
              </span>
              <span className="ml-auto text-amber-600 dark:text-amber-400">View</span>
            </button>
          )}

          {/* Active Tweaks Chips */}
          {activeTweaks.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeTweaks.map((tweak) => (
                <Badge key={tweak.id} variant="outline" className="text-xs gap-1">
                  {tweak.icon && <span>{tweak.icon}</span>}
                  {tweak.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expanded: Full selection UI */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t">
          {/* AI Suggestions Info */}
          {suggestions.length > 0 && (
            <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Tweaks with{' '}
                <span className="text-amber-500 font-medium">sparkle icons</span> are
                AI-suggested based on your input
              </span>
            </div>
          )}

          {/* Thinking Modes Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Thinking Mode
            </h4>
            <div className="flex flex-wrap gap-2">
              {THINKING_TWEAKS.map((tweak) =>
                renderTweakButton(
                  tweak,
                  selectedTweaks.thinking === tweak.id,
                  handleThinkingChange,
                  suggestedIds.has(tweak.id)
                )
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {SKILL_TWEAKS.map((tweak) =>
                renderTweakButton(
                  tweak,
                  selectedTweaks.skills.includes(tweak.id),
                  handleSkillToggle,
                  suggestedIds.has(tweak.id)
                )
              )}
            </div>
          </div>

          {/* Behaviors Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Behaviors
            </h4>
            <div className="flex flex-wrap gap-2">
              {BEHAVIOR_TWEAKS.map((tweak) =>
                renderTweakButton(
                  tweak,
                  selectedTweaks.behaviors.includes(tweak.id),
                  handleBehaviorToggle,
                  suggestedIds.has(tweak.id)
                )
              )}
            </div>
          </div>

          {/* Token Impact Summary */}
          {activeCount > 0 && (
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
              <span>Estimated token impact:</span>
              <span
                className={cn(
                  'font-mono',
                  tokenImpact.includes('200') || tokenImpact.includes('300')
                    ? 'text-red-500'
                    : tokenImpact.includes('100')
                      ? 'text-orange-500'
                      : tokenImpact.includes('50') || tokenImpact.includes('75')
                        ? 'text-yellow-500'
                        : 'text-green-500'
                )}
              >
                {tokenImpact}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
