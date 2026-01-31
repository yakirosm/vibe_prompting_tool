'use client';

import * as React from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionBarProps {
  selectedCount: number;
  onAddTags: () => void;
  onRemoveTags: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onAddTags,
  onRemoveTags,
  onClearSelection,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
      <span className="text-sm font-medium">
        {selectedCount} prompt{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onAddTags}>
          <Tag className="h-4 w-4 mr-2" />
          Add Tags
        </Button>
        <Button size="sm" variant="outline" onClick={onRemoveTags}>
          <Tag className="h-4 w-4 mr-2" />
          Remove Tags
        </Button>
        <Button size="sm" variant="ghost" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
