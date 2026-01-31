'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Bot, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { AgentCard } from '@/components/agents/agent-card';
import { AgentFormDialog } from '@/components/agents/agent-form-dialog';
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
import type { CustomAgent } from '@prompt-ops/shared';

type ViewMode = 'grid' | 'list';

export default function AgentsPage() {
  const [agents, setAgents] = React.useState<CustomAgent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editAgent, setEditAgent] = React.useState<CustomAgent | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchAgents = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const response = await fetch(`/api/agents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch agents');

      const data = await response.json();
      setAgents(data.agents || []);
    } catch {
      toast.error('Failed to load custom agents');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/agents/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setAgents((prev) => prev.filter((a) => a.id !== deleteId));
      toast.success('Agent deleted');
    } catch {
      toast.error('Failed to delete agent');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSuccess = (agent: CustomAgent) => {
    if (editAgent) {
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? agent : a))
      );
    } else {
      setAgents((prev) => [agent, ...prev]);
    }
    setEditAgent(null);
  };

  const handleEdit = (agent: CustomAgent) => {
    setEditAgent(agent);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Agents</h1>
          <p className="text-muted-foreground">
            {agents.length} agent{agents.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditAgent(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4 me-2" />
          New Agent
        </Button>
      </div>

      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
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
          <Spinner size="lg" variant="muted" />
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No custom agents yet</h3>
          <p className="text-muted-foreground mt-1">
            Create a custom agent to personalize your prompt generation.
          </p>
          <Button className="mt-4" onClick={() => { setEditAgent(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 me-2" />
            Create your first agent
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
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={() => handleEdit(agent)}
              onDelete={() => setDeleteId(agent.id)}
            />
          ))}
        </div>
      )}

      {/* Agent Form Dialog */}
      <AgentFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        agent={editAgent}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom agent? This action cannot be undone.
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
