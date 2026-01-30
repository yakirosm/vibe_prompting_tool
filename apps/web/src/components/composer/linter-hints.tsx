'use client';

import * as React from 'react';
import { AlertTriangle, Info, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LinterSuggestion } from '@prompt-ops/shared';

interface LinterHintsProps {
  suggestions: LinterSuggestion[];
  onDismiss: (index: number) => void;
  onAddField?: (field: string) => void;
}

export function LinterHints({ suggestions, onDismiss, onAddField }: LinterHintsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" role="status" aria-label="Prompt suggestions">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
            suggestion.type === 'warning'
              ? 'bg-warning/10 text-warning border border-warning/20'
              : 'bg-primary/10 text-primary border border-primary/20'
          }`}
        >
          {suggestion.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p>{suggestion.message}</p>
            {suggestion.field && onAddField && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs mt-1"
                onClick={() => onAddField(suggestion.field!)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add {suggestion.field}
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={() => onDismiss(index)}
            aria-label="Dismiss suggestion"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
