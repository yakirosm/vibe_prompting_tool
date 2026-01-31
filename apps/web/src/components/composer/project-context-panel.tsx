'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  FormInput,
  MessageSquare,
  ClipboardPaste,
  X,
  Check,
  Sparkles,
  FolderPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectFormDialog } from '@/components/projects/project-form-dialog';
import { cn } from '@/lib/utils';

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

interface ProjectContextPanelProps {
  context: string;
  onContextChange: (context: string) => void;
  disabled?: boolean;
  isAuthenticated?: boolean;
  onProjectCreated?: (project: Project) => void;
}

type InputMethod = 'manual' | 'form' | 'paste' | 'chat';

interface FormData {
  projectName: string;
  techStack: string;
  description: string;
  conventions: string;
}

export function ProjectContextPanel({
  context,
  onContextChange,
  disabled,
  isAuthenticated = false,
  onProjectCreated,
}: ProjectContextPanelProps) {
  const t = useTranslations('composer.projectContext');
  const tProjects = useTranslations('projects.form');
  const tToast = useTranslations('toast');

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeMethod, setActiveMethod] = React.useState<InputMethod>('manual');
  const [formData, setFormData] = React.useState<FormData>({
    projectName: '',
    techStack: '',
    description: '',
    conventions: '',
  });
  const [pastedResponse, setPastedResponse] = React.useState('');
  const [isParsing, setIsParsing] = React.useState(false);
  const [showProjectDialog, setShowProjectDialog] = React.useState(false);

  const hasContext = context.trim().length > 0;

  // Generate context from form data
  const generateContextFromForm = React.useCallback(() => {
    const parts: string[] = [];

    if (formData.projectName) {
      parts.push(`Project: ${formData.projectName}`);
    }
    if (formData.techStack) {
      parts.push(`Tech Stack: ${formData.techStack}`);
    }
    if (formData.description) {
      parts.push(`Description: ${formData.description}`);
    }
    if (formData.conventions) {
      parts.push(`Conventions: ${formData.conventions}`);
    }

    if (parts.length > 0) {
      onContextChange(parts.join('\n\n'));
    }
  }, [formData, onContextChange]);

  // Parse pasted AI response
  const handleParsePastedResponse = React.useCallback(async () => {
    if (!pastedResponse.trim()) return;

    setIsParsing(true);

    // Simple parsing - extract key sections
    try {
      // Look for common patterns in AI responses
      const lines = pastedResponse.split('\n');
      const extracted: string[] = [];

      let currentSection = '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines
        if (!trimmed) continue;

        // Check for section headers
        const headerMatch = trimmed.match(/^\*?\*?([^:*]+)\*?\*?:/i);
        if (headerMatch) {
          currentSection = headerMatch[1].trim();
        }

        // Include relevant content
        if (
          trimmed.includes('stack') ||
          trimmed.includes('framework') ||
          trimmed.includes('pattern') ||
          trimmed.includes('convention') ||
          trimmed.includes('architecture') ||
          trimmed.includes('structure') ||
          currentSection.toLowerCase().includes('tech') ||
          currentSection.toLowerCase().includes('overview') ||
          currentSection.toLowerCase().includes('stack')
        ) {
          extracted.push(trimmed);
        }
      }

      // If we extracted useful info, use it; otherwise use the full paste
      const result = extracted.length > 5
        ? extracted.slice(0, 20).join('\n')
        : pastedResponse.slice(0, 2000);

      onContextChange(result);
      setPastedResponse('');
      setActiveMethod('manual');
    } finally {
      setIsParsing(false);
    }
  }, [pastedResponse, onContextChange]);

  const handleClearContext = React.useCallback(() => {
    onContextChange('');
    setFormData({
      projectName: '',
      techStack: '',
      description: '',
      conventions: '',
    });
    setPastedResponse('');
  }, [onContextChange]);

  // Build initial project data from current form/context for pre-filling the dialog
  const getInitialProjectData = React.useCallback(() => {
    // If form has data, use it
    if (formData.projectName || formData.techStack || formData.description) {
      return {
        name: formData.projectName || 'New Project',
        description: formData.description || null,
        stack_summary: formData.techStack || null,
        context_pack: context || null,
      };
    }
    // Otherwise use the manual context
    if (context) {
      return {
        name: 'New Project',
        description: null,
        stack_summary: null,
        context_pack: context,
      };
    }
    return null;
  }, [formData, context]);

  const handleProjectCreated = React.useCallback((project: Project) => {
    // Apply the project's context pack to the context panel
    if (project.context_pack) {
      onContextChange(project.context_pack);
    } else {
      // Build context from project fields
      const parts: string[] = [];
      if (project.name) parts.push(`Project: ${project.name}`);
      if (project.stack_summary) parts.push(`Tech Stack: ${project.stack_summary}`);
      if (project.description) parts.push(`Description: ${project.description}`);
      if (parts.length > 0) {
        onContextChange(parts.join('\n\n'));
      }
    }

    toast.success(tToast('success.created'));
    onProjectCreated?.(project);
  }, [onContextChange, onProjectCreated, tToast]);

  const inputMethods = [
    { id: 'manual' as const, label: t('manual'), icon: FileText },
    { id: 'form' as const, label: t('form'), icon: FormInput },
    { id: 'paste' as const, label: t('pasteResponse'), icon: ClipboardPaste },
    { id: 'chat' as const, label: t('chat'), icon: MessageSquare, disabled: true },
  ];

  return (
    <Card className={cn(
      'transition-all duration-200',
      isExpanded && 'ring-1 ring-primary/20'
    )}>
      <CardHeader
        className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">{t('title')}</CardTitle>
            {hasContext && (
              <Badge variant="secondary" className="text-xs">
                {t('active')}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasContext && !isExpanded && (
              <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                {context.slice(0, 50)}...
              </span>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4 animate-slide-down">
          <p className="text-xs text-muted-foreground mb-4">
            {t('description')}
          </p>

          <Tabs value={activeMethod} onValueChange={(v) => setActiveMethod(v as InputMethod)}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              {inputMethods.map((method) => (
                <TabsTrigger
                  key={method.id}
                  value={method.id}
                  disabled={method.disabled || disabled}
                  className="text-xs gap-1"
                >
                  <method.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{method.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Manual Input */}
            <TabsContent value="manual" className="space-y-3">
              <Textarea
                value={context}
                onChange={(e) => onContextChange(e.target.value)}
                placeholder={t('manualPlaceholder')}
                className="min-h-[120px] text-sm"
                disabled={disabled}
              />
            </TabsContent>

            {/* Form Input */}
            <TabsContent value="form" className="space-y-3">
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="project-name" className="text-xs">{t('projectName')}</Label>
                  <Input
                    id="project-name"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder={t('projectNamePlaceholder')}
                    className="h-8 text-sm"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tech-stack" className="text-xs">{t('techStack')}</Label>
                  <Input
                    id="tech-stack"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    placeholder={t('techStackPlaceholder')}
                    className="h-8 text-sm"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs">{tProjects('description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('descriptionPlaceholder')}
                    className="min-h-[60px] text-sm"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="conventions" className="text-xs">{t('codingConventions')}</Label>
                  <Input
                    id="conventions"
                    value={formData.conventions}
                    onChange={(e) => setFormData({ ...formData, conventions: e.target.value })}
                    placeholder={t('conventionsPlaceholder')}
                    className="h-8 text-sm"
                    disabled={disabled}
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={generateContextFromForm}
                disabled={disabled || !Object.values(formData).some(v => v.trim())}
                className="w-full"
              >
                <Check className="h-3 w-3 me-1" />
                {t('applyFormData')}
              </Button>
            </TabsContent>

            {/* Paste AI Response */}
            <TabsContent value="paste" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t('pasteDescription')}
              </p>
              <Textarea
                value={pastedResponse}
                onChange={(e) => setPastedResponse(e.target.value)}
                placeholder={t('pastePlaceholder')}
                className="min-h-[120px] text-sm font-mono"
                disabled={disabled}
              />
              <Button
                size="sm"
                onClick={handleParsePastedResponse}
                disabled={disabled || !pastedResponse.trim() || isParsing}
                className="w-full"
              >
                {isParsing ? (
                  <>{t('parsing')}</>
                ) : (
                  <>
                    <ClipboardPaste className="h-3 w-3 me-1" />
                    {t('parseAndApply')}
                  </>
                )}
              </Button>
            </TabsContent>

            {/* Chat (Coming Soon) */}
            <TabsContent value="chat" className="space-y-3">
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('chatComingSoon')}</p>
                  <p className="text-xs">{t('chatDescription')}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {hasContext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearContext}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3 w-3 me-1" />
                  {t('clearContext')}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProjectDialog(true)}
                  disabled={disabled}
                  className="gap-1.5"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  {t('createProject')}
                </Button>
              ) : (
                <Link href="/app/projects">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    {t('createProject')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {/* Project Creation Dialog */}
      {isAuthenticated && (
        <ProjectFormDialog
          open={showProjectDialog}
          onOpenChange={setShowProjectDialog}
          project={null}
          onSuccess={handleProjectCreated}
          initialData={getInitialProjectData()}
        />
      )}
    </Card>
  );
}
