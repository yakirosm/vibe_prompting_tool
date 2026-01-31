'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('composer.input');

  const detectedLanguage = React.useMemo(() => {
    if (!value || value.length < 10) return null;
    return detectInputLanguage(value);
  }, [value]);

  return (
    <Card className={`flex flex-col flex-1 overflow-hidden ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-4 py-3">
        <Label htmlFor="input-textarea" className="text-sm font-medium">
          {t('title')}
        </Label>
        {detectedLanguage && (
          <Badge variant="secondary" className="text-xs animate-fade-in">
            {getLanguageDisplayName(detectedLanguage)} {t('detected')}
          </Badge>
        )}
      </div>
      <div className="flex-1 min-h-0 border-t border-border/50">
        <Textarea
          id="input-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('placeholder')}
          className={`h-full min-h-[200px] border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 ${isRTL ? 'text-right' : ''}`}
          dir={isRTL ? 'rtl' : 'ltr'}
          showCharCount
          maxLength={5000}
          disabled={disabled}
        />
      </div>
    </Card>
  );
}
