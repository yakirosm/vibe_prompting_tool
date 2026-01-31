'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';
import { PromptCard } from '@/components/library/prompt-card';
import { Spinner } from '@/components/ui/spinner';
import {
  LibraryFiltersBar,
  type LibraryFilters,
  type ViewMode,
} from '@/components/library/library-filters';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tag } from '@prompt-ops/shared';

interface Prompt {
  id: string;
  input_raw: string;
  output_prompt: string;
  agent_profile_id: string;
  strategy: string;
  variant_type: string;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
}

export default function LibraryPage() {
  const [prompts, setPrompts] = React.useState<Prompt[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [filters, setFilters] = React.useState<LibraryFilters>({
    search: '',
    agent: '',
    strategy: '',
    tags: [],
    favoritesOnly: false,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const LIMIT = 20;

  const fetchPrompts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: LIMIT.toString(),
        offset: (page * LIMIT).toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (filters.search) params.set('search', filters.search);
      if (filters.agent) params.set('agent', filters.agent);
      if (filters.strategy) params.set('strategy', filters.strategy);
      if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
      if (filters.favoritesOnly) params.set('favorites', 'true');

      const response = await fetch(`/api/prompts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch prompts');

      const data = await response.json();
      setPrompts(data.prompts || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  React.useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // Fetch tags on mount
  React.useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags || []);
        }
      } catch {
        // Silently fail - tags are optional
      }
    };
    fetchTags();
  }, []);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [filters]);

  const handleToggleFavorite = async (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) return;

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !prompt.is_favorite }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, is_favorite: !p.is_favorite } : p
        )
      );
      toast.success(prompt.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update prompt');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/prompts/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setPrompts((prev) => prev.filter((p) => p.id !== deleteId));
      setTotal((prev) => prev - 1);
      toast.success('Prompt deleted');
    } catch {
      toast.error('Failed to delete prompt');
    } finally {
      setDeleteId(null);
    }
  };

  const handleTagClick = (tag: string) => {
    setFilters((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prompt Library</h1>
        <p className="text-muted-foreground">
          {total} saved prompt{total !== 1 ? 's' : ''}
        </p>
      </div>

      <LibraryFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        availableTags={tags}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="muted" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No prompts found</h3>
          <p className="text-muted-foreground mt-1">
            {filters.search || filters.agent || filters.strategy || filters.tags.length > 0 || filters.favoritesOnly
              ? 'Try adjusting your filters'
              : 'Generate and save prompts to see them here'}
          </p>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-4'
            }
          >
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onCopy={() => {}}
                onToggleFavorite={() => handleToggleFavorite(prompt.id)}
                onDelete={() => setDeleteId(prompt.id)}
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prompt? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
