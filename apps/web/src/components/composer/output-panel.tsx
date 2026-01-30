'use client';

import * as React from 'react';
import { Copy, RotateCcw, Save, Check, HelpCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GeneratedPrompt, PromptLength } from '@prompt-ops/shared';
import { formatPromptForCopy } from '@/lib/ai/prompt-builder';

interface OutputPanelProps {
  output: GeneratedPrompt | null;
  variants?: Record<PromptLength, GeneratedPrompt | null>;
  activeVariant: PromptLength;
  onVariantChange: (variant: PromptLength) => void;
  onRegenerate: () => void;
  onSave: () => void;
  isLoading?: boolean;
  isAuthenticated?: boolean;
}

export function OutputPanel({
  output,
  variants,
  activeVariant,
  onVariantChange,
  onRegenerate,
  onSave,
  isLoading,
  isAuthenticated = false,
}: OutputPanelProps) {
  const [copied, setCopied] = React.useState(false);

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

            {/* Highlighted questions section */}
            {hasQuestions && (
              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Clarifying Questions</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentOutput.clarifyingQuestions!.length} questions
                  </Badge>
                </div>
                <ul className="space-y-2">
                  {currentOutput.clarifyingQuestions!.map((question, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary font-medium shrink-0">{idx + 1}.</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="border-t px-4 py-3 flex justify-end gap-2">
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
