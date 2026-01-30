'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Copy, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';

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

interface Prompt {
  id: string;
  input_raw: string;
  output_prompt: string;
  agent_profile_id: string;
  created_at: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = React.useState<Project | null>(null);
  const [prompts, setPrompts] = React.useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [newLogEntry, setNewLogEntry] = React.useState('');
  const [isSavingLog, setIsSavingLog] = React.useState(false);

  const fetchProject = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push('/app/projects');
          return;
        }
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data.project);
      setPrompts(data.prompts || []);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  React.useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddLogEntry = async () => {
    if (!newLogEntry.trim() || !project) return;

    setIsSavingLog(true);
    try {
      const updatedLog = [...(project.development_log || []), newLogEntry.trim()];

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ development_log: updatedLog }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setProject((prev) => prev ? { ...prev, development_log: updatedLog } : null);
      setNewLogEntry('');
      toast.success('Log entry added');
    } catch {
      toast.error('Failed to add log entry');
    } finally {
      setIsSavingLog(false);
    }
  };

  const copyContextPack = () => {
    if (project?.context_pack) {
      navigator.clipboard.writeText(project.context_pack);
      toast.success('Context pack copied');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" variant="muted" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/app/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => setShowEditDialog(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Context Pack */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Context Pack</CardTitle>
                {project.context_pack && (
                  <Button variant="ghost" size="sm" onClick={copyContextPack}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <CardDescription>
                Reusable context automatically injected into prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.context_pack ? (
                <pre className="text-sm bg-muted/50 p-4 rounded-md whitespace-pre-wrap font-mono">
                  {project.context_pack}
                </pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No context pack defined. Edit the project to add one.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Development Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Development Log</CardTitle>
              <CardDescription>
                Track progress and changes in your development project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="log-entry">New Entry</Label>
                <Textarea
                  id="log-entry"
                  value={newLogEntry}
                  onChange={(e) => setNewLogEntry(e.target.value)}
                  placeholder="Add a note about recent progress or changes..."
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={handleAddLogEntry}
                  disabled={!newLogEntry.trim() || isSavingLog}
                  loading={isSavingLog}
                >
                  Add Entry
                </Button>
              </div>

              {project.development_log && project.development_log.length > 0 ? (
                <div className="space-y-2 pt-4 border-t">
                  {project.development_log.slice().reverse().map((entry, index) => (
                    <div
                      key={index}
                      className="text-sm p-3 bg-muted/30 rounded-md"
                    >
                      {entry}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm pt-4 border-t">
                  No log entries yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Prompts</CardTitle>
              <CardDescription>
                Prompts associated with this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prompts.length > 0 ? (
                <div className="space-y-3">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-3 border rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{prompt.agent_profile_id}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(prompt.created_at)}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{prompt.input_raw}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No prompts yet. Generate prompts while this project is selected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Tech Stack</Label>
                <p className="text-sm">
                  {project.stack_summary || 'Not specified'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Default Agent</Label>
                <p className="text-sm">
                  <Badge variant="outline">{project.default_agent || 'cursor'}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Default Mode</Label>
                <p className="text-sm">
                  <Badge variant="secondary">{project.default_mode || 'quick'}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Created</Label>
                <p className="text-sm">{formatDate(project.created_at)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Last Updated</Label>
                <p className="text-sm">{formatDate(project.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <ProjectFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        project={project}
        onSuccess={(updated) => setProject(updated)}
      />
    </div>
  );
}
