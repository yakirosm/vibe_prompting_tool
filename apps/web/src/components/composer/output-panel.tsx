'use client';

import * as React from 'react';
import { Copy, RotateCcw, Save, Check, Sparkles, Tag as TagIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { GeneratedPrompt, PromptLength, Tag } from '@prompt-ops/shared';
import { formatPromptForCopy } from '@/lib/ai/prompt-builder';
import { ClarifyingQuestionsForm } from './clarifying-questions-form';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#6366f1', // indigo (default)
  '#a855f7', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

interface OutputPanelProps {
  output: GeneratedPrompt | null;
  variants?: Record<PromptLength, GeneratedPrompt | null>;
  activeVariant: PromptLength;
  onVariantChange: (variant: PromptLength) => void;
  onRegenerate: () => void;
  onSave: () => void;
  onAnswerQuestions?: (answers: Record<number, string>) => void;
  isLoading?: boolean;
  isAnswering?: boolean;
  isAuthenticated?: boolean;
  availableTags?: Tag[];
  selectedTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  onCreateTag?: (name: string, color: string) => Promise<void>;
}

export function OutputPanel({
  output,
  variants,
  activeVariant,
  onVariantChange,
  onRegenerate,
  onSave,
  onAnswerQuestions,
  isLoading,
  isAnswering = false,
  isAuthenticated = false,
  availableTags = [],
  selectedTags = [],
  onTagsChange,
  onCreateTag,
}: OutputPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const [showCreateTag, setShowCreateTag] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState('');
  const [newTagColor, setNewTagColor] = React.useState('#6366f1');
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);

  const handleToggleTag = React.useCallback((tagName: string) => {
    if (!onTagsChange) return;
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  }, [selectedTags, onTagsChange]);

  const handleCreateTag = React.useCallback(async () => {
    if (!onCreateTag || !newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      await onCreateTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor('#6366f1');
      setShowCreateTag(false);
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setIsCreatingTag(false);
    }
  }, [onCreateTag, newTagName, newTagColor]);

  const handleRemoveTag = React.useCallback((tagName: string) => {
    if (!onTagsChange) return;
    onTagsChange(selectedTags.filter((t) => t !== tagName));
  }, [selectedTags, onTagsChange]);

  const currentOutput = variants?.[activeVariant] || output;
  const hasQuestions = currentOutput?.clarifyingQuestions && currentOutput.clarifyingQuestions.length > 0;

  const handleCopy = React.useCallback(async () => {
    if (!currentOutput) return;

    const text = formatPromptForCopy(currentOutput);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [currentOutput]);

  if (!currentOutput && !isLoading) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <CardContent className="text-center text-muted-foreground py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">Your generated prompt will appear here</p>
          <p className="text-sm mt-1">Enter your issue and click Generate</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2 px-4 border-b">
        <Tabs value={activeVariant} onValueChange={(v) => onVariantChange(v as PromptLength)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="short" disabled={isLoading} className="transition-all">
              Short
            </TabsTrigger>
            <TabsTrigger value="standard" disabled={isLoading} className="transition-all">
              Standard
            </TabsTrigger>
            <TabsTrigger value="detailed" disabled={isLoading} className="transition-all">
              Detailed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1 p-4 overflow-auto">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-20 bg-muted rounded mt-4" />
            <div className="h-4 bg-muted rounded w-2/3 mt-4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        ) : currentOutput ? (
          <div className="space-y-4 animate-fade-in" aria-live="polite">
            {/* Main prompt content */}
            <div className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm whitespace-pre-wrap">
              {formatPromptForCopy(currentOutput)}
            </div>

            {/* Interactive Clarifying Questions Form */}
            {hasQuestions && onAnswerQuestions && (
              <div className="mt-6">
                <ClarifyingQuestionsForm
                  questions={currentOutput.clarifyingQuestions!}
                  onSubmit={onAnswerQuestions}
                  isSubmitting={isAnswering}
                />
              </div>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="border-t px-4 py-3 flex items-center gap-2">
        {/* Tag selector - only show when authenticated and output exists */}
        {isAuthenticated && output && onTagsChange && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Selected tags display */}
            <div className="flex items-center gap-1 flex-wrap">
              {selectedTags.map((tagName) => {
                const tag = availableTags.find((t) => t.name === tagName);
                const color = tag?.color || '#6366f1';
                return (
                  <span
                    key={tagName}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border"
                    style={{
                      backgroundColor: `${color}15`,
                      borderColor: `${color}40`,
                      borderLeftWidth: '3px',
                      borderLeftColor: color,
                    }}
                  >
                    {tagName}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tagName)}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>

            {/* Tag dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  <TagIcon className="h-4 w-4" />
                  <span className="sr-only">Tags</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {availableTags.length > 0 ? (
                  <>
                    {availableTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag.id}
                        checked={selectedTags.includes(tag.name)}
                        onCheckedChange={() => handleToggleTag(tag.name)}
                        onSelect={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.name}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No tags yet
                  </div>
                )}

                {/* Create new tag section */}
                {showCreateTag ? (
                  <div className="p-2 space-y-2">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateTag();
                        } else if (e.key === 'Escape') {
                          setShowCreateTag(false);
                          setNewTagName('');
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewTagColor(color)}
                          className={cn(
                            'h-5 w-5 rounded-full transition-all',
                            'hover:scale-110 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-primary',
                            newTagColor === color && 'ring-1 ring-offset-1 ring-primary'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        className="h-7 flex-1"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim() || isCreatingTag}
                      >
                        {isCreatingTag ? 'Creating...' : 'Create'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7"
                        onClick={() => {
                          setShowCreateTag(false);
                          setNewTagName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCreateTag(true)}
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create new tag
                  </button>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Spacer when no tags section */}
        {!(isAuthenticated && output && onTagsChange) && <div className="flex-1" />}

        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading || !output}
          className="transition-all hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Regenerate
        </Button>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isLoading || !output}
            className="transition-all"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          onClick={handleCopy}
          disabled={isLoading || !currentOutput}
          className="transition-all"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-success" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
