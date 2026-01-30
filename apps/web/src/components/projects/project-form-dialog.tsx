'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AGENT_OPTIONS } from '@prompt-ops/shared';

interface Project {
  id: string;
  name: string;
  description: string | null;
  stack_summary: string | null;
  context_pack: string | null;
  default_agent: string | null;
  default_mode: string | null;
  development_log: string[] | null;
  created_at: string;
  updated_at: string;
}

interface InitialProjectData {
  name?: string;
  description?: string | null;
  stack_summary?: string | null;
  context_pack?: string | null;
}

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess: (project: Project) => void;
  initialData?: InitialProjectData | null;
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
  initialData,
}: ProjectFormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    stack_summary: '',
    context_pack: '',
    default_agent: 'cursor',
    default_mode: 'quick',
  });

  const isEditing = !!project;

  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        stack_summary: project.stack_summary || '',
        context_pack: project.context_pack || '',
        default_agent: project.default_agent || 'cursor',
        default_mode: project.default_mode || 'quick',
      });
    } else if (initialData) {
      // Pre-fill from initialData (e.g., from project context panel)
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        stack_summary: initialData.stack_summary || '',
        context_pack: initialData.context_pack || '',
        default_agent: 'cursor',
        default_mode: 'quick',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        stack_summary: '',
        context_pack: '',
        default_agent: 'cursor',
        default_mode: 'quick',
      });
    }
  }, [project, initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/projects/${project.id}` : '/api/projects';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save project');

      const data = await response.json();
      toast.success(isEditing ? 'Project updated' : 'Project created');
      onSuccess(data.project);
      onOpenChange(false);
    } catch {
      toast.error('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your project details and settings.'
                : 'Create a new project to organize your prompts and context.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="My Awesome Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the project..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stack_summary">Tech Stack</Label>
              <Input
                id="stack_summary"
                value={formData.stack_summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, stack_summary: e.target.value }))}
                placeholder="e.g., Next.js, TypeScript, Tailwind CSS"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context_pack">Context Pack</Label>
              <Textarea
                id="context_pack"
                value={formData.context_pack}
                onChange={(e) => setFormData((prev) => ({ ...prev, context_pack: e.target.value }))}
                placeholder="Reusable context to inject into prompts..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This context will be automatically included in prompts for this project.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default_agent">Default Agent</Label>
                <Select
                  value={formData.default_agent}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, default_agent: value }))}
                >
                  <SelectTrigger id="default_agent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_mode">Default Mode</Label>
                <Select
                  value={formData.default_mode}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, default_mode: value }))}
                >
                  <SelectTrigger id="default_mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Convert</SelectItem>
                    <SelectItem value="smart-form">Smart Form</SelectItem>
                    <SelectItem value="wizard">Wizard</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
