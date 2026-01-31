'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Tag, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagCard } from '@/components/tags/tag-card';
import { TagFormDialog } from '@/components/tags/tag-form-dialog';
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
import type { Tag as TagType } from '@prompt-ops/shared';

type ViewMode = 'grid' | 'list';
type SortOption = 'created_at-desc' | 'created_at-asc' | 'name-asc' | 'name-desc' | 'usage-desc' | 'usage-asc';

export default function TagsPage() {
  const [tags, setTags] = React.useState<TagType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [sortOption, setSortOption] = React.useState<SortOption>('created_at-desc');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editTag, setEditTag] = React.useState<TagType | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchTags = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [sortBy, sortOrder] = sortOption.split('-') as [string, string];
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);

      const response = await fetch(`/api/tags?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tags');

      const data = await response.json();
      setTags(data.tags || []);
    } catch {
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  }, [search, sortOption]);

  React.useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/tags/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setTags((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success('Tag deleted');
    } catch {
      toast.error('Failed to delete tag');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSuccess = (tag: TagType) => {
    if (editTag) {
      setTags((prev) =>
        prev.map((t) => (t.id === tag.id ? tag : t))
      );
    } else {
      setTags((prev) => [tag, ...prev]);
    }
    setEditTag(null);
  };

  const handleEdit = (tag: TagType) => {
    setEditTag(tag);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            {tags.length} tag{tags.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditTag(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Tag
        </Button>
      </div>

      {/* Search, Sort, and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest first</SelectItem>
            <SelectItem value="created_at-asc">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="usage-desc">Most used</SelectItem>
            <SelectItem value="usage-asc">Least used</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Toggle
            pressed={viewMode === 'grid'}
            onPressedChange={() => setViewMode('grid')}
            size="sm"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === 'list'}
            onPressedChange={() => setViewMode('list')}
            size="sm"
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="muted" />
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No tags yet</h3>
          <p className="text-muted-foreground mt-1">
            Create tags to organize your prompts.
          </p>
          <Button className="mt-4" onClick={() => { setEditTag(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first tag
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-4'
          }
        >
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onEdit={() => handleEdit(tag)}
              onDelete={() => setDeleteId(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Tag Form Dialog */}
      <TagFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        tag={editTag}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const tagToDelete = tags.find((t) => t.id === deleteId);
                const usageCount = tagToDelete?.usage_count || 0;
                if (usageCount > 0) {
                  return (
                    <>
                      This tag is used by <strong>{usageCount} prompt{usageCount !== 1 ? 's' : ''}</strong>.
                      Deleting it will remove the tag from those prompts. This action cannot be undone.
                    </>
                  );
                }
                return 'Are you sure you want to delete this tag? This action cannot be undone.';
              })()}
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
