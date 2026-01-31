'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Lightbulb, Sparkles, Plus, Settings2 } from 'lucide-react';
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
  type CustomTweak,
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
  const t = useTranslations('composer.promptTweaks');

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [customTweaks, setCustomTweaks] = React.useState<CustomTweak[]>([]);
  const [isLoadingCustom, setIsLoadingCustom] = React.useState(false);

  // Fetch custom tweaks
  React.useEffect(() => {
    const fetchCustomTweaks = async () => {
      setIsLoadingCustom(true);
      try {
        const response = await fetch('/api/tweaks?activeOnly=true');
        if (response.ok) {
          const data = await response.json();
          setCustomTweaks(data.tweaks || []);
        }
      } catch {
        // Silently fail - custom tweaks are optional
      } finally {
        setIsLoadingCustom(false);
      }
    };
    fetchCustomTweaks();
  }, []);

  // Calculate active count
  const activeCount =
    selectedTweaks.skills.length +
    (selectedTweaks.thinking ? 1 : 0) +
    selectedTweaks.behaviors.length +
    (selectedTweaks.custom?.length || 0);

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
        const newBehaviors = selectedTweaks.behaviors.filter((id) => id !== behaviorId);
        onTweaksChange({ ...selectedTweaks, behaviors: newBehaviors });
      } else {
        const conflicts = getConflictingTweaks(behaviorId);
        const newBehaviors = selectedTweaks.behaviors.filter((id) => !conflicts.includes(id));
        newBehaviors.push(behaviorId);
        onTweaksChange({ ...selectedTweaks, behaviors: newBehaviors });
      }
    },
    [selectedTweaks, onTweaksChange]
  );

  // Handle custom tweak toggle
  const handleCustomToggle = React.useCallback(
    (customId: string) => {
      const currentCustom = selectedTweaks.custom || [];
      const newCustom = currentCustom.includes(customId)
        ? currentCustom.filter((id) => id !== customId)
        : [...currentCustom, customId];
      onTweaksChange({ ...selectedTweaks, custom: newCustom });
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
                  {t('tokenCost')} {TOKEN_COST_LABELS[tweak.tokenCost]}
                </p>
                {isDisabledByConflict && (
                  <p className="text-xs text-destructive">
                    {t('conflictsWithSelected')}
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

  // Render a custom tweak button
  const renderCustomTweakButton = React.useCallback(
    (tweak: CustomTweak, isSelected: boolean) => {
      return (
        <TooltipProvider key={tweak.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Toggle
                  pressed={isSelected}
                  onPressedChange={() => handleCustomToggle(tweak.id)}
                  disabled={disabled}
                  size="sm"
                  variant="outline"
                  className={cn(
                    'gap-1.5 text-xs transition-all',
                    isSelected && 'bg-primary/10 border-primary/40 text-primary'
                  )}
                >
                  <span className="text-sm">{tweak.icon || '✨'}</span>
                  <span>{tweak.short_name}</span>
                </Toggle>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px]">
              <div className="space-y-1.5">
                <p className="font-medium">{tweak.name}</p>
                {tweak.description && (
                  <p className="text-xs text-muted-foreground">{tweak.description}</p>
                )}
                <p className="text-xs font-mono text-muted-foreground">Custom tweak</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    [disabled, handleCustomToggle]
  );

  // Get active tweaks for collapsed view
  const activeTweaksList = React.useMemo(() => {
    const tweaks: { id: string; icon?: string; label: string }[] = [];

    if (selectedTweaks.thinking) {
      const t = getTweakById(selectedTweaks.thinking);
      if (t) tweaks.push({ id: t.id, icon: t.icon, label: t.label });
    }
    for (const skillId of selectedTweaks.skills) {
      const t = getTweakById(skillId);
      if (t) tweaks.push({ id: t.id, icon: t.icon, label: t.label });
    }
    for (const behaviorId of selectedTweaks.behaviors) {
      const t = getTweakById(behaviorId);
      if (t) tweaks.push({ id: t.id, icon: t.icon, label: t.label });
    }
    // Add custom tweaks
    for (const customId of selectedTweaks.custom || []) {
      const ct = customTweaks.find((c) => c.id === customId);
      if (ct) tweaks.push({ id: ct.id, icon: ct.icon || '✨', label: ct.short_name });
    }
    return tweaks;
  }, [selectedTweaks, customTweaks]);

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
          'w-full flex items-center justify-between p-4 text-start transition-colors',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{t('title')}</span>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeCount} {t('active')}
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
                {t('suggestedCount', { count: suggestions.length })}
              </span>
              <span className="ms-auto text-amber-600 dark:text-amber-400">{t('view')}</span>
            </button>
          )}

          {/* Active Tweaks Chips */}
          {activeTweaksList.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {activeTweaksList.map((tweak) => (
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
                {t('aiSuggested')}
              </span>
            </div>
          )}

          {/* Thinking Modes Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('thinkingMode')}
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
              {t('skills')}
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
              {t('behaviors')}
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

          {/* Custom Tweaks Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('customTweaks')}
              </h4>
              <Link
                href="/app/tweaks"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings2 className="h-3 w-3" />
                {t('manage')}
              </Link>
            </div>
            {isLoadingCustom ? (
              <p className="text-xs text-muted-foreground">{t('loading')}</p>
            ) : customTweaks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customTweaks.map((tweak) =>
                  renderCustomTweakButton(
                    tweak,
                    selectedTweaks.custom?.includes(tweak.id) || false
                  )
                )}
              </div>
            ) : (
              <Link
                href="/app/tweaks"
                className="flex items-center gap-2 p-2 rounded-md border border-dashed text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('createFirst')}</span>
              </Link>
            )}
          </div>

          {/* Token Impact Summary */}
          {activeCount > 0 && (
            <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t">
              <span>{t('estimatedTokenImpact')}</span>
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
