import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCharCount, maxLength = 5000, value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0;
    const isNearLimit = charCount > maxLength * 0.9;
    const isAtLimit = charCount >= maxLength;

    return (
      <div className="relative h-full flex flex-col">
        <textarea
          className={cn(
            'flex-1 w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-sm shadow-input ring-offset-background placeholder:text-muted-foreground transition-shadow focus-visible:shadow-input-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none scrollbar-thin',
            showCharCount && 'pb-10',
            className
          )}
          ref={ref}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && (
          <div
            className={cn(
              'absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-medium transition-colors',
              'bg-muted/80 backdrop-blur-sm border shadow-sm',
              isAtLimit && 'bg-destructive/10 text-destructive border-destructive/20',
              isNearLimit && !isAtLimit && 'bg-warning/10 text-warning-foreground border-warning/20',
              !isNearLimit && !isAtLimit && 'text-foreground/70'
            )}
          >
            {charCount.toLocaleString()}/{maxLength.toLocaleString()}
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
