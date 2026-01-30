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
import { AGENT_ICON_OPTIONS } from './agent-card';
import type { CustomAgent } from '@prompt-ops/shared';

interface AgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: CustomAgent | null;
  onSuccess: (agent: CustomAgent) => void;
}

export function AgentFormDialog({
  open,
  onOpenChange,
  agent,
  onSuccess,
}: AgentFormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    icon: 'bot',
    tone: '',
    structure_preference: '',
    emphasis: '',
    extra_phrase: '',
    custom_instructions: '',
    documentation_url: '',
  });

  const isEditing = !!agent;

  React.useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        description: agent.description || '',
        icon: agent.icon || 'bot',
        tone: agent.tone || '',
        structure_preference: agent.structure_preference || '',
        emphasis: agent.emphasis || '',
        extra_phrase: agent.extra_phrase || '',
        custom_instructions: agent.custom_instructions || '',
        documentation_url: agent.documentation_url || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'bot',
        tone: '',
        structure_preference: '',
        emphasis: '',
        extra_phrase: '',
        custom_instructions: '',
        documentation_url: '',
      });
    }
  }, [agent, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Agent name is required');
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/agents/${agent.id}` : '/api/agents';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save agent');

      const data = await response.json();
      toast.success(isEditing ? 'Agent updated' : 'Agent created');
      onSuccess(data.agent);
      onOpenChange(false);
    } catch {
      toast.error('Failed to save agent');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Agent' : 'New Custom Agent'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your custom agent configuration.'
                : 'Create a custom agent with your preferred settings for prompt generation.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="My Custom Agent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger id="icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_ICON_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this agent is optimized for..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Input
                  id="tone"
                  value={formData.tone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tone: e.target.value }))}
                  placeholder="e.g., Technical, Friendly"
                />
                <p className="text-xs text-muted-foreground">
                  The communication style for prompts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emphasis">Emphasis</Label>
                <Input
                  id="emphasis"
                  value={formData.emphasis}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emphasis: e.target.value }))}
                  placeholder="e.g., Code quality, Performance"
                />
                <p className="text-xs text-muted-foreground">
                  What the agent prioritizes
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="structure_preference">Structure Preference</Label>
              <Input
                id="structure_preference"
                value={formData.structure_preference}
                onChange={(e) => setFormData((prev) => ({ ...prev, structure_preference: e.target.value }))}
                placeholder="e.g., Problem → Solution → Tests"
              />
              <p className="text-xs text-muted-foreground">
                How the agent structures its output
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra_phrase">Key Phrase</Label>
              <Input
                id="extra_phrase"
                value={formData.extra_phrase}
                onChange={(e) => setFormData((prev) => ({ ...prev, extra_phrase: e.target.value }))}
                placeholder="e.g., Always include unit tests"
              />
              <p className="text-xs text-muted-foreground">
                A key instruction always included in prompts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_instructions">Custom Instructions</Label>
              <Textarea
                id="custom_instructions"
                value={formData.custom_instructions}
                onChange={(e) => setFormData((prev) => ({ ...prev, custom_instructions: e.target.value }))}
                placeholder="Additional instructions for the AI when generating prompts..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentation_url">Documentation URL (optional)</Label>
              <Input
                id="documentation_url"
                type="url"
                value={formData.documentation_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, documentation_url: e.target.value }))}
                placeholder="https://docs.example.com/agent-guide"
              />
              <p className="text-xs text-muted-foreground">
                Reference documentation for the agent
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
