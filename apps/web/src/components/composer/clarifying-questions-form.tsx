'use client';

import * as React from 'react';
import { Send, MessageSquare, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuestionAnswer {
  questionIndex: number;
  selectedOption: number | null; // null if custom
  customAnswer: string;
}

interface ClarifyingQuestionsFormProps {
  questions: string[];
  onSubmit: (answers: Record<number, string>) => void;
  isSubmitting?: boolean;
}

// Generate predefined answer options based on the question content
function generatePredefinedAnswers(question: string): string[] {
  const q = question.toLowerCase();

  // Design/UI related questions
  if (q.includes('design') || q.includes('style') || q.includes('ui') || q.includes('look')) {
    return [
      'Follow existing design patterns',
      'Use minimal/clean design',
      'Make it visually prominent',
    ];
  }

  // Behavior/functionality questions
  if (q.includes('behavior') || q.includes('happen') || q.includes('should') || q.includes('work')) {
    return [
      'Keep it simple and straightforward',
      'Add confirmation/feedback',
      'Make it configurable by user',
    ];
  }

  // Error handling questions
  if (q.includes('error') || q.includes('fail') || q.includes('invalid') || q.includes('edge case')) {
    return [
      'Show user-friendly error message',
      'Fail silently with logging',
      'Prevent invalid states entirely',
    ];
  }

  // Technology/implementation questions
  if (q.includes('technology') || q.includes('library') || q.includes('framework') || q.includes('approach')) {
    return [
      'Use existing project dependencies',
      'Keep it lightweight/vanilla',
      'Use industry standard solution',
    ];
  }

  // Performance questions
  if (q.includes('performance') || q.includes('speed') || q.includes('optimize')) {
    return [
      'Prioritize simplicity over speed',
      'Optimize for performance',
      'Balance both approaches',
    ];
  }

  // Scope questions
  if (q.includes('scope') || q.includes('include') || q.includes('feature') || q.includes('additional')) {
    return [
      'Keep scope minimal',
      'Include related improvements',
      'Full implementation with extras',
    ];
  }

  // Default generic options
  return [
    'Yes, proceed with this approach',
    'No, use an alternative',
    'Need more context to decide',
  ];
}

export function ClarifyingQuestionsForm({
  questions,
  onSubmit,
  isSubmitting = false,
}: ClarifyingQuestionsFormProps) {
  const [answers, setAnswers] = React.useState<QuestionAnswer[]>(() =>
    questions.map((_, index) => ({
      questionIndex: index,
      selectedOption: null,
      customAnswer: '',
    }))
  );

  const [showCustomInput, setShowCustomInput] = React.useState<Set<number>>(new Set());

  const predefinedAnswers = React.useMemo(
    () => questions.map(generatePredefinedAnswers),
    [questions]
  );

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionIndex === questionIndex
          ? { ...a, selectedOption: optionIndex, customAnswer: '' }
          : a
      )
    );
    // Hide custom input when selecting predefined
    setShowCustomInput((prev) => {
      const next = new Set(prev);
      next.delete(questionIndex);
      return next;
    });
  };

  const handleCustomInputToggle = (questionIndex: number) => {
    setShowCustomInput((prev) => {
      const next = new Set(prev);
      if (next.has(questionIndex)) {
        next.delete(questionIndex);
      } else {
        next.add(questionIndex);
      }
      return next;
    });
    // Clear predefined selection when switching to custom
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionIndex === questionIndex
          ? { ...a, selectedOption: null }
          : a
      )
    );
  };

  const handleCustomInputChange = (questionIndex: number, value: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionIndex === questionIndex
          ? { ...a, customAnswer: value, selectedOption: null }
          : a
      )
    );
  };

  const handleSubmit = () => {
    const answersMap: Record<number, string> = {};

    answers.forEach((answer) => {
      if (answer.customAnswer.trim()) {
        answersMap[answer.questionIndex] = answer.customAnswer.trim();
      } else if (answer.selectedOption !== null) {
        answersMap[answer.questionIndex] = predefinedAnswers[answer.questionIndex][answer.selectedOption];
      }
    });

    onSubmit(answersMap);
  };

  const answeredCount = answers.filter(
    (a) => a.selectedOption !== null || a.customAnswer.trim()
  ).length;

  const allAnswered = answeredCount === questions.length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base">Clarifying Questions</CardTitle>
          </div>
          <Badge variant={allAnswered ? 'default' : 'secondary'} className="text-xs">
            {answeredCount}/{questions.length} answered
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Answer these questions to refine the prompt. Select a predefined answer or provide your own.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {questions.map((question, qIndex) => {
          const answer = answers[qIndex];
          const options = predefinedAnswers[qIndex];
          const isCustomMode = showCustomInput.has(qIndex);
          const hasAnswer = answer.selectedOption !== null || answer.customAnswer.trim();

          return (
            <div
              key={qIndex}
              className={cn(
                'p-4 rounded-lg border transition-all',
                hasAnswer
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-background'
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0">
                  {qIndex + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed">{question}</p>
              </div>

              <div className="ml-9 space-y-2">
                {/* Predefined options */}
                {!isCustomMode && (
                  <div className="space-y-2">
                    {options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        type="button"
                        onClick={() => handleOptionSelect(qIndex, oIndex)}
                        disabled={isSubmitting}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-md text-sm transition-all',
                          'border hover:border-primary/50 hover:bg-primary/5',
                          answer.selectedOption === oIndex
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border bg-background'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                              answer.selectedOption === oIndex
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/30'
                            )}
                          >
                            {answer.selectedOption === oIndex && (
                              <Check className="w-2.5 h-2.5 text-primary-foreground" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom input */}
                {isCustomMode && (
                  <div className="space-y-2">
                    <Label htmlFor={`custom-${qIndex}`} className="text-xs text-muted-foreground">
                      Your custom answer:
                    </Label>
                    <Input
                      id={`custom-${qIndex}`}
                      value={answer.customAnswer}
                      onChange={(e) => handleCustomInputChange(qIndex, e.target.value)}
                      placeholder="Type your answer..."
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                  </div>
                )}

                {/* Toggle custom input */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCustomInputToggle(qIndex)}
                  disabled={isSubmitting}
                  className="text-xs text-muted-foreground hover:text-foreground mt-1"
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  {isCustomMode ? 'Use predefined answers' : 'Write custom answer'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <p className="text-xs text-muted-foreground">
            {allAnswered
              ? 'All questions answered. Ready to update prompt.'
              : `Answer ${questions.length - answeredCount} more to continue.`}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount === 0}
            size="sm"
            className="gap-2"
          >
            {isSubmitting ? (
              <>Updating...</>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Update Prompt
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
