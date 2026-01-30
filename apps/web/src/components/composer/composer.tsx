'use client';

import * as React from 'react';
import { Sparkles, Copy, Check, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InputPanel } from './input-panel';
import { OptionsBar } from './options-bar';
import { OutputPanel } from './output-panel';
import { LinterHints } from './linter-hints';
import { ProjectContextPanel } from './project-context-panel';
import { TweaksSelector } from './tweaks-selector';
import {
  type PromptLength,
  type PromptStrategy,
  type AgentId,
  type BuiltInAgentId,
  type GeneratedPrompt,
  type LinterSuggestion,
  type InputLanguage,
  type SelectedTweaks,
  type TweakSuggestion,
  lintPromptInput,
  validatePromptInput,
  detectInputLanguage,
  suggestTweaks,
  isCustomAgentId,
} from '@prompt-ops/shared';

// Discovery prompt for new users
const DISCOVERY_PROMPT = `I'm starting a new coding project and need your help understanding the codebase structure and making a plan. Please analyze the project and provide:

1. **Project Overview**: What type of project is this? (web app, API, library, etc.)
2. **Tech Stack**: What frameworks, languages, and key dependencies are being used?
3. **Architecture**: How is the code organized? (folder structure, patterns used)
4. **Entry Points**: Where does the application start? Key files to understand first?
5. **Current State**: What features exist? What's working vs incomplete?
6. **Conventions**: What coding patterns, naming conventions, or styles are followed?

After your analysis, I'll share this context with my prompt generator to create better, more targeted prompts for this project.`;

interface SavePromptData {
  input: string;
  agent: AgentId;
  length: PromptLength;
  strategy: PromptStrategy;
  generatedPrompt: GeneratedPrompt;
}

interface ComposerProps {
  isAuthenticated?: boolean;
  onSave?: (data: SavePromptData) => Promise<void>;
}

export function Composer({ isAuthenticated = false, onSave }: ComposerProps) {
  // Input state
  const [input, setInput] = React.useState('');
  const [agent, setAgent] = React.useState<AgentId>('cursor');
  const [length, setLength] = React.useState<PromptLength>('standard');
  const [strategy, setStrategy] = React.useState<PromptStrategy>('implement');
  const [askClarifyingQuestions, setAskClarifyingQuestions] = React.useState(false);
  const [projectContext, setProjectContext] = React.useState('');
  const [selectedTweaks, setSelectedTweaks] = React.useState<SelectedTweaks>({
    skills: [],
    thinking: undefined,
    behaviors: [],
    custom: [],
  });

  // Output state
  const [output, setOutput] = React.useState<GeneratedPrompt | null>(null);
  const [activeVariant, setActiveVariant] = React.useState<PromptLength>('standard');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAnswering, setIsAnswering] = React.useState(false);

  // Linter state
  const [suggestions, setSuggestions] = React.useState<LinterSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = React.useState<Set<number>>(new Set());

  // Welcome/discovery state
  const [showWelcome, setShowWelcome] = React.useState(true);
  const [discoveryCopied, setDiscoveryCopied] = React.useState(false);

  // Language detection for RTL support
  const detectedLanguage = React.useMemo<InputLanguage>(() => {
    if (!input || input.length < 10) return 'en';
    return detectInputLanguage(input);
  }, [input]);
  const isRTL = detectedLanguage === 'he';

  // Compute tweak suggestions based on input
  const tweakSuggestions = React.useMemo<TweakSuggestion[]>(() => {
    if (!input || input.length < 20) return [];
    const currentAgent = isCustomAgentId(agent) ? undefined : (agent as BuiltInAgentId);
    return suggestTweaks({ input, currentAgent });
  }, [input, agent]);

  // Hide welcome when user starts typing
  React.useEffect(() => {
    if (input.length > 0) {
      setShowWelcome(false);
    }
  }, [input]);

  // Lint input on change
  React.useEffect(() => {
    if (input.length > 20) {
      const allSuggestions = lintPromptInput(input);
      setSuggestions(allSuggestions.filter((_, i) => !dismissedSuggestions.has(i)));
    } else {
      setSuggestions([]);
    }
  }, [input, dismissedSuggestions]);

  // Auto-save draft to localStorage
  React.useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (input.length > 0) {
        localStorage.setItem(
          'prompt-ops-draft',
          JSON.stringify({ input, agent, length, strategy, askClarifyingQuestions, selectedTweaks })
        );
      }
    }, 10000);

    return () => clearTimeout(saveTimer);
  }, [input, agent, length, strategy, askClarifyingQuestions, selectedTweaks]);

  // Load draft on mount
  React.useEffect(() => {
    const draft = localStorage.getItem('prompt-ops-draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.input) setInput(parsed.input);
        if (parsed.agent) setAgent(parsed.agent);
        if (parsed.length) setLength(parsed.length);
        if (parsed.strategy) setStrategy(parsed.strategy);
        if (parsed.askClarifyingQuestions !== undefined) {
          setAskClarifyingQuestions(parsed.askClarifyingQuestions);
        }
        if (parsed.selectedTweaks) {
          setSelectedTweaks({
            skills: parsed.selectedTweaks.skills || [],
            thinking: parsed.selectedTweaks.thinking,
            behaviors: parsed.selectedTweaks.behaviors || [],
            custom: parsed.selectedTweaks.custom || [],
          });
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleGenerate = React.useCallback(async () => {
    // Validate input
    const validation = validatePromptInput(input);
    if (!validation.valid) {
      toast.error(validation.errors[0]?.message || 'Invalid input');
      return;
    }

    setIsLoading(true);
    setOutput(null);

    try {
      // Only include tweaks if any are selected
      const hasTweaks =
        selectedTweaks.skills.length > 0 ||
        selectedTweaks.thinking ||
        selectedTweaks.behaviors.length > 0 ||
        (selectedTweaks.custom && selectedTweaks.custom.length > 0);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          agent,
          length,
          strategy,
          askClarifyingQuestions,
          projectContext: projectContext.trim() || undefined,
          tweaks: hasTweaks ? selectedTweaks : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate prompt');
      }

      const data = await response.json();
      setOutput(data.prompt);
      setActiveVariant(length);
      toast.success('Prompt generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate prompt');
    } finally {
      setIsLoading(false);
    }
  }, [input, agent, length, strategy, askClarifyingQuestions, projectContext, selectedTweaks]);

  const handleRegenerate = React.useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleSave = React.useCallback(async () => {
    if (output && onSave) {
      try {
        await onSave({
          input,
          agent,
          length,
          strategy,
          generatedPrompt: output,
        });
        toast.success('Prompt saved');
      } catch {
        toast.error('Failed to save prompt');
      }
    }
  }, [output, onSave, input, agent, length, strategy]);

  const handleDismissSuggestion = React.useCallback((index: number) => {
    setDismissedSuggestions((prev) => new Set([...prev, index]));
  }, []);

  // Handle answers to clarifying questions - regenerate with answers included
  const handleAnswerQuestions = React.useCallback(async (answers: Record<number, string>) => {
    if (!output?.clarifyingQuestions) return;

    setIsAnswering(true);

    try {
      // Build the answers text to append to the input
      const answersText = output.clarifyingQuestions
        .map((question, idx) => {
          const answer = answers[idx];
          if (answer) {
            return `Q: ${question}\nA: ${answer}`;
          }
          return null;
        })
        .filter(Boolean)
        .join('\n\n');

      // Regenerate with the answers included as additional context
      const enhancedInput = `${input}\n\n---\nAdditional context from clarifying questions:\n${answersText}`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: enhancedInput,
          agent,
          length,
          strategy,
          askClarifyingQuestions: false, // Don't ask more questions after answering
          projectContext: projectContext.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update prompt');
      }

      const data = await response.json();
      setOutput(data.prompt);
      toast.success('Prompt updated with your answers');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update prompt');
    } finally {
      setIsAnswering(false);
    }
  }, [output, input, agent, length, strategy, projectContext]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  const handleCopyDiscovery = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(DISCOVERY_PROMPT);
      setDiscoveryCopied(true);
      toast.success('Discovery prompt copied! Paste it in your AI coding assistant.');
      setTimeout(() => setDiscoveryCopied(false), 3000);
    } catch {
      toast.error('Failed to copy');
    }
  }, []);

  // Welcome card for new users
  const WelcomeCard = showWelcome && !output && (
    <Card className="border-primary/20 bg-primary/5 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">New to this project?</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWelcome(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">
          Start by sending this discovery prompt to your AI assistant. It will help you understand your codebase and provide context for better prompts.
        </p>
        <div className="bg-background/80 rounded-lg p-3 text-xs font-mono text-muted-foreground max-h-32 overflow-auto mb-3 border">
          {DISCOVERY_PROMPT.slice(0, 200)}...
        </div>
        <Button
          onClick={handleCopyDiscovery}
          variant="outline"
          size="sm"
          className="w-full transition-all"
        >
          {discoveryCopied ? (
            <>
              <Check className="h-4 w-4 mr-2 text-success" />
              Copied! Now paste in your AI assistant
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Discovery Prompt
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  // Collapsed welcome hint
  const CollapsedWelcome = !showWelcome && !output && input.length === 0 && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowWelcome(true)}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Lightbulb className="h-3 w-3 mr-1" />
      Show discovery prompt
    </Button>
  );

  // Reusable input side component
  const InputSide = (
    <div className="flex flex-col gap-4 h-full">
      {WelcomeCard}
      {CollapsedWelcome}

      <div className="flex-1 min-h-0 flex flex-col">
        <InputPanel value={input} onChange={setInput} disabled={isLoading} isRTL={isRTL} />
      </div>

      <ProjectContextPanel
        context={projectContext}
        onContextChange={setProjectContext}
        disabled={isLoading}
        isAuthenticated={isAuthenticated}
      />

      <OptionsBar
        agent={agent}
        length={length}
        strategy={strategy}
        askClarifyingQuestions={askClarifyingQuestions}
        onAgentChange={setAgent}
        onLengthChange={setLength}
        onStrategyChange={setStrategy}
        onAskClarifyingQuestionsChange={setAskClarifyingQuestions}
        disabled={isLoading}
      />

      <TweaksSelector
        selectedTweaks={selectedTweaks}
        suggestions={tweakSuggestions}
        onTweaksChange={setSelectedTweaks}
        disabled={isLoading}
      />

      <LinterHints
        suggestions={suggestions}
        onDismiss={handleDismissSuggestion}
      />

      <div className="space-y-2">
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isLoading || input.trim().length < 10}
          loading={isLoading}
          className="w-full transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isRTL ? 'צור פרומפט' : 'Generate Prompt'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {isRTL ? (
            <>
              לחץ <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-sans">⌘</kbd>+
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-sans">Enter</kbd> ליצירה
            </>
          ) : (
            <>
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-sans">⌘</kbd>+
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-sans">Enter</kbd> to generate
            </>
          )}
        </p>
      </div>
    </div>
  );

  // Reusable output side component
  const OutputSide = (
    <div className="flex flex-col">
      <OutputPanel
        output={output}
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
        onRegenerate={handleRegenerate}
        onSave={handleSave}
        onAnswerQuestions={handleAnswerQuestions}
        isLoading={isLoading}
        isAnswering={isAnswering}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );

  return (
    <div className="h-full" onKeyDown={handleKeyDown}>
      <div className="grid lg:grid-cols-2 gap-6 h-full">
        {isRTL ? (
          <>
            {/* RTL: Output on LEFT, Input on RIGHT */}
            {OutputSide}
            {InputSide}
          </>
        ) : (
          <>
            {/* LTR: Input on LEFT, Output on RIGHT */}
            {InputSide}
            {OutputSide}
          </>
        )}
      </div>
    </div>
  );
}
