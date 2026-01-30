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
import type { CustomTweak, CustomTweakCategory } from '@prompt-ops/shared';

const TWEAK_ICONS = [
  { value: 'sparkles', label: 'Sparkles', emoji: '✨' },
  { value: 'brain', label: 'Brain', emoji: '🧠' },
  { value: 'rocket', label: 'Rocket', emoji: '🚀' },
  { value: 'shield', label: 'Shield', emoji: '🛡️' },
  { value: 'zap', label: 'Zap', emoji: '⚡' },
  { value: 'target', label: 'Target', emoji: '🎯' },
  { value: 'palette', label: 'Palette', emoji: '🎨' },
  { value: 'code', label: 'Code', emoji: '💻' },
  { value: 'test', label: 'Test', emoji: '🧪' },
  { value: 'book', label: 'Book', emoji: '📚' },
  { value: 'gear', label: 'Gear', emoji: '⚙️' },
  { value: 'star', label: 'Star', emoji: '⭐' },
];

const CATEGORY_OPTIONS: { value: CustomTweakCategory; label: string; description: string }[] = [
  { value: 'skill', label: 'Skill', description: 'Domain-specific capabilities' },
  { value: 'behavior', label: 'Behavior', description: 'Modify AI approach' },
  { value: 'custom', label: 'Custom', description: 'General purpose tweak' },
];

interface TweakFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tweak?: CustomTweak | null;
  onSuccess: (tweak: CustomTweak) => void;
}

export function TweakFormDialog({
  open,
  onOpenChange,
  tweak,
  onSuccess,
}: TweakFormDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    short_name: '',
    instruction: '',
    description: '',
    category: 'custom' as CustomTweakCategory,
    icon: 'sparkles',
  });

  const isEditing = !!tweak;

  React.useEffect(() => {
    if (tweak) {
      setFormData({
        name: tweak.name,
        short_name: tweak.short_name,
        instruction: tweak.instruction,
        description: tweak.description || '',
        category: tweak.category,
        icon: tweak.icon || 'sparkles',
      });
    } else {
      setFormData({
        name: '',
        short_name: '',
        instruction: '',
        description: '',
        category: 'custom',
        icon: 'sparkles',
      });
    }
  }, [tweak, open]);

  // Auto-generate short_name from name
  React.useEffect(() => {
    if (!isEditing && formData.name && !formData.short_name) {
      const words = formData.name.split(' ').slice(0, 2);
      const shortName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      if (shortName.length <= 15) {
        setFormData(prev => ({ ...prev, short_name: shortName }));
      }
    }
  }, [formData.name, isEditing, formData.short_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Tweak name is required');
      return;
    }

    if (!formData.short_name.trim()) {
      toast.error('Short name is required');
      return;
    }

    if (formData.short_name.trim().length > 15) {
      toast.error('Short name must be 15 characters or less');
      return;
    }

    if (!formData.instruction.trim()) {
      toast.error('Instruction is required');
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditing ? `/api/tweaks/${tweak.id}` : '/api/tweaks';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save tweak');
      }

      const data = await response.json();
      toast.success(isEditing ? 'Tweak updated' : 'Tweak created');
      onSuccess(data.tweak);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save tweak');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedIcon = TWEAK_ICONS.find(i => i.value === formData.icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Tweak' : 'New Custom Tweak'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your custom tweak configuration.'
                : 'Create a custom tweak to modify how prompts are generated.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="name">Tweak Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., TypeScript Expert"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger id="icon">
                    <SelectValue>
                      <span className="text-lg">{selectedIcon?.emoji || '✨'}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TWEAK_ICONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{option.emoji}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="short_name">Short Name * (max 15 chars)</Label>
                <Input
                  id="short_name"
                  value={formData.short_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, short_name: e.target.value }))}
                  placeholder="e.g., TS Expert"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.short_name.length}/15 - Displayed on tag buttons
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as CustomTweakCategory }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                placeholder="Brief description of what this tweak does..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instruction">Instruction *</Label>
              <Textarea
                id="instruction"
                value={formData.instruction}
                onChange={(e) => setFormData((prev) => ({ ...prev, instruction: e.target.value }))}
                placeholder="The instruction that will be injected into the prompt...

Example:
SKILL: TypeScript Expert
- Use TypeScript best practices
- Prefer strict type checking
- Use interfaces over types where appropriate"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This text will be added to the prompt when this tweak is selected
              </p>
            </div>

            {/* Preview */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Preview:</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedIcon?.emoji || '✨'}</span>
                <span className="text-sm font-medium">{formData.short_name || 'Short Name'}</span>
              </div>
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
