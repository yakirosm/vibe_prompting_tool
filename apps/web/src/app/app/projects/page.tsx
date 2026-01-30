'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, FolderKanban, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
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

type ViewMode = 'grid' | 'list';

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('grid');
  const [showDialog, setShowDialog] = React.useState(false);
  const [editProject, setEditProject] = React.useState<Project | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const fetchProjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setProjects(data.projects || []);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/projects/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSuccess = (project: Project) => {
    if (editProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p))
      );
    } else {
      setProjects((prev) => [project, ...prev]);
    }
    setEditProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
    setShowDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditProject(null); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
          <Spinner size="lg" variant="muted" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No projects yet</h3>
          <p className="text-muted-foreground mt-1">
            Create a project to organize your prompts and context.
          </p>
          <Button className="mt-4" onClick={() => { setEditProject(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first project
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
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleEdit(project)}
              onDelete={() => setDeleteId(project.id)}
            />
          ))}
        </div>
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        project={editProject}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This will not delete associated prompts,
              but they will no longer be linked to this project.
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
