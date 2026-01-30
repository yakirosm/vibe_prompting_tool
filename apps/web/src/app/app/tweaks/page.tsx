'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, Sparkles, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { TweakCard } from '@/components/tweaks/tweak-card';
import { TweakFormDialog } from '@/components/tweaks/tweak-form-dialog';
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
import type { CustomTweak } from '@prompt-ops/shared';

type ViewMode = 'grid' | 'list';

export default function TweaksPage() {
  const [tweaks, setTweaks] = React.useState<CustomTweak[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editTweak, setEditTweak] = React.useState<CustomTweak | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchTweaks = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const response = await fetch(`/api/tweaks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tweaks');

      const data = await response.json();
      setTweaks(data.tweaks || []);
    } catch {
      toast.error('Failed to load custom tweaks');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchTweaks();
  }, [fetchTweaks]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/tweaks/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setTweaks((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success('Tweak deleted');
    } catch {
      toast.error('Failed to delete tweak');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSuccess = (tweak: CustomTweak) => {
    if (editTweak) {
      setTweaks((prev) =>
        prev.map((t) => (t.id === tweak.id ? tweak : t))
      );
    } else {
      setTweaks((prev) => [tweak, ...prev]);
    }
    setEditTweak(null);
  };

  const handleEdit = (tweak: CustomTweak) => {
    setEditTweak(tweak);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Tweaks</h1>
          <p className="text-muted-foreground">
            {tweaks.length} tweak{tweaks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditTweak(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Tweak
        </Button>
      </div>

      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tweaks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tweaks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No custom tweaks yet</h3>
          <p className="text-muted-foreground mt-1">
            Create custom tweaks to add your own modifiers to prompt generation.
          </p>
          <Button className="mt-4" onClick={() => { setEditTweak(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first tweak
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
          {tweaks.map((tweak) => (
            <TweakCard
              key={tweak.id}
              tweak={tweak}
              onEdit={() => handleEdit(tweak)}
              onDelete={() => setDeleteId(tweak.id)}
            />
          ))}
        </div>
      )}

      {/* Tweak Form Dialog */}
      <TweakFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        tweak={editTweak}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tweak</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom tweak? This action cannot be undone.
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
