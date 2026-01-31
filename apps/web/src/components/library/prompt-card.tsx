'use client';

import * as React from 'react';
import { Copy, Star, Trash2, MoreVertical, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Tag as TagType } from '@prompt-ops/shared';

interface PromptCardProps {
  prompt: {
    id: string;
    input_raw: string;
    output_prompt: string;
    agent_profile_id: string;
    strategy: string;
    variant_type: string;
    tags: string[] | null;
    is_favorite: boolean;
    created_at: string;
  };
  availableTags: TagType[];
  onCopy: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onTagClick?: (tag: string) => void;
  onManageTags?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

export function PromptCard({
  prompt,
  availableTags,
  onCopy,
  onToggleFavorite,
  onDelete,
  onTagClick,
  onManageTags,
  isSelectable = false,
  isSelected = false,
  onSelectChange,
}: PromptCardProps) {
  const getTagColor = (tagName: string): string => {
    const tag = availableTags.find((t) => t.name === tagName);
    return tag?.color || '#6b7280'; // Default gray if tag not found
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.output_prompt);
    toast.success('Copied to clipboard');
    onCopy();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className={cn(
      'flex flex-col h-full hover:shadow-md transition-shadow',
      isSelected && 'ring-2 ring-primary'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isSelectable && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectChange?.(!!checked)}
                className="me-1"
              />
            )}
            <Badge variant="outline">{prompt.agent_profile_id}</Badge>
            <Badge variant="secondary">{prompt.strategy}</Badge>
            <Badge variant="secondary">{prompt.variant_type}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onToggleFavorite}
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  prompt.is_favorite && 'fill-yellow-400 text-yellow-400'
                )}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 me-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onManageTags}>
                  <Tag className="h-4 w-4 me-2" />
                  Manage Tags
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 me-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Input</p>
          <p className="text-sm">{truncateText(prompt.input_raw, 100)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Output</p>
          <p className="text-sm font-mono bg-muted/50 p-2 rounded text-xs">
            {truncateText(prompt.output_prompt, 150)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex items-center justify-between border-t">
        <div className="flex items-center gap-1 flex-wrap">
          {prompt.tags?.slice(0, 3).map((tag) => {
            const tagColor = getTagColor(tag);
            return (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: `${tagColor}20`,
                  borderColor: tagColor,
                  borderLeftWidth: '3px',
                }}
                onClick={() => onTagClick?.(tag)}
              >
                {tag}
              </Badge>
            );
          })}
          {prompt.tags && prompt.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{prompt.tags.length - 3}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(prompt.created_at)}
        </span>
      </CardFooter>
    </Card>
  );
}
