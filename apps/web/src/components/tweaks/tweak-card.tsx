'use client';

import * as React from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CustomTweak } from '@prompt-ops/shared';

interface TweakCardProps {
  tweak: CustomTweak;
  onEdit: () => void;
  onDelete: () => void;
}

export function TweakCard({ tweak, onEdit, onDelete }: TweakCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const categoryColors: Record<string, string> = {
    skill: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    behavior: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg">
              {tweak.icon || '✨'}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{tweak.name}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs font-mono">
                  {tweak.short_name}
                </Badge>
                {!tweak.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {tweak.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {tweak.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs ${categoryColors[tweak.category] || categoryColors.custom}`}>
            {tweak.category}
          </Badge>
        </div>
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs font-mono text-muted-foreground line-clamp-2">
          {tweak.instruction}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Updated {formatDate(tweak.updated_at)}
        </p>
      </CardContent>
    </Card>
  );
}
