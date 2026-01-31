'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Check, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Tag } from '@prompt-ops/shared';

interface BulkTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'remove';
  selectedPromptIds: string[];
  availableTags: Tag[];
  onSuccess: () => void;
}

export function BulkTagDialog({
  open,
  onOpenChange,
  mode,
  selectedPromptIds,
  availableTags,
  onSuccess,
}: BulkTagDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [tagSearch, setTagSearch] = React.useState('');

  const filteredTags = React.useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    return availableTags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [availableTags, tagSearch]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedTags([]);
      setTagSearch('');
    }
  }, [open]);

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/prompts/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptIds: selectedPromptIds,
          action: mode,
          tags: selectedTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      const data = await response.json();
      toast.success(data.message);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update tags');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Tags' : 'Remove Tags'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? `Select tags to add to ${selectedPromptIds.length} prompt${selectedPromptIds.length !== 1 ? 's' : ''}.`
              : `Select tags to remove from ${selectedPromptIds.length} prompt${selectedPromptIds.length !== 1 ? 's' : ''}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {availableTags.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tags available. Create tags first to organize your prompts.
            </p>
          ) : (
            <>
              {availableTags.length > 5 && (
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="ps-9"
                  />
                </div>
              )}
              {filteredTags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No matching tags
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                  {filteredTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-all',
                          'hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                          isSelected && 'ring-2 ring-offset-1 ring-primary'
                        )}
                        style={{
                          backgroundColor: isSelected ? `${tag.color}30` : `${tag.color}10`,
                          borderColor: tag.color,
                        }}
                      >
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || availableTags.length === 0 || selectedTags.length === 0}
          >
            {isLoading
              ? 'Updating...'
              : mode === 'add'
                ? `Add ${selectedTags.length > 0 ? selectedTags.length : ''} Tag${selectedTags.length !== 1 ? 's' : ''}`
                : `Remove ${selectedTags.length > 0 ? selectedTags.length : ''} Tag${selectedTags.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
