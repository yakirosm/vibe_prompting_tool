'use client';

import * as React from 'react';
import Link from 'next/link';
import { FolderKanban, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    stack_summary: string | null;
    default_agent: string | null;
    created_at: string;
    updated_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link href={`/app/projects/${project.id}`} className="flex-1">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg hover:underline">{project.name}</CardTitle>
            </div>
          </Link>
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
        {project.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 flex-wrap">
          {project.default_agent && (
            <Badge variant="outline">{project.default_agent}</Badge>
          )}
          {project.stack_summary && (
            <Badge variant="secondary" className="text-xs">
              {project.stack_summary.length > 30
                ? project.stack_summary.substring(0, 30) + '...'
                : project.stack_summary}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Updated {formatDate(project.updated_at)}
        </p>
      </CardContent>
    </Card>
  );
}
