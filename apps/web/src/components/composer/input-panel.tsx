'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { detectInputLanguage, getLanguageDisplayName } from '@prompt-ops/shared';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isRTL?: boolean;
}

export function InputPanel({ value, onChange, disabled, isRTL = false }: InputPanelProps) {
  const detectedLanguage = React.useMemo(() => {
    if (!value || value.length < 10) return null;
    return detectInputLanguage(value);
  }, [value]);

  return (
    <Card className={`flex flex-col flex-1 p-4 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-3">
        <Label htmlFor="input-textarea" className="text-sm font-medium">
          {isRTL ? 'תאר את הבעיה שלך' : 'Describe your issue'}
        </Label>
        {detectedLanguage && (
          <Badge variant="secondary" className="text-xs animate-fade-in">
            {getLanguageDisplayName(detectedLanguage)} detected
          </Badge>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <Textarea
          id="input-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isRTL
            ? "תאר את הבעיה, הבקשה לפיצ'ר, או הבאג...\n\nאפשר לכתוב בעברית או באנגלית. הפלט תמיד יהיה באנגלית."
            : "Describe your coding issue, feature request, or bug...\n\nYou can write in Hebrew or English. The output will always be in English."}
          className={`h-full min-h-[200px] ${isRTL ? 'text-right' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
          showCharCount
          maxLength={5000}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
