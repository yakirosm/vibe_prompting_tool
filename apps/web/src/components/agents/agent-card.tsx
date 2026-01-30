'use client';

import * as React from 'react';
import { MoreVertical, Pencil, Trash2, Bot, Sparkles, Zap, Brain, Code, Wand2, Terminal, Cpu, MessageSquare, Lightbulb } from 'lucide-react';
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
import type { CustomAgent } from '@prompt-ops/shared';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  bot: Bot,
  sparkles: Sparkles,
  zap: Zap,
  brain: Brain,
  code: Code,
  wand: Wand2,
  terminal: Terminal,
  cpu: Cpu,
  message: MessageSquare,
  lightbulb: Lightbulb,
};

interface AgentCardProps {
  agent: CustomAgent;
  onEdit: () => void;
  onDelete: () => void;
}

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const IconComponent = ICON_MAP[agent.icon || 'bot'] || Bot;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{agent.name}</CardTitle>
              {!agent.is_active && (
                <Badge variant="secondary" className="text-xs mt-0.5">
                  Inactive
                </Badge>
              )}
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
        {agent.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {agent.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          {agent.tone && (
            <Badge variant="outline" className="text-xs">
              {agent.tone}
            </Badge>
          )}
          {agent.emphasis && (
            <Badge variant="secondary" className="text-xs">
              {agent.emphasis.length > 25
                ? agent.emphasis.substring(0, 25) + '...'
                : agent.emphasis}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Updated {formatDate(agent.updated_at)}
        </p>
      </CardContent>
    </Card>
  );
}

export const AGENT_ICON_OPTIONS = Object.keys(ICON_MAP).map((key) => ({
  value: key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  icon: ICON_MAP[key],
}));
