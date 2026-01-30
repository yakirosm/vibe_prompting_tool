-- Prompt Ops Copilot - Extended Features Migration
-- Run this in your Supabase SQL editor after 001_initial_schema.sql

-- Add new agent profiles
insert into public.agent_profiles (id, name, dialect_rules, output_format) values
  ('claude-code', 'Claude Code', '{"tone": "thoughtful", "emphasis": "understanding before action"}', '{"format": "markdown"}'),
  ('windsurf', 'Windsurf', '{"tone": "collaborative", "emphasis": "multi-file changes"}', '{"format": "markdown"}'),
  ('bolt', 'Bolt', '{"tone": "fast", "emphasis": "working code quickly"}', '{"format": "markdown"}'),
  ('v0', 'v0', '{"tone": "ui-focused", "emphasis": "clean components"}', '{"format": "markdown"}'),
  ('aider', 'Aider', '{"tone": "git-aware", "emphasis": "precise diffs"}', '{"format": "markdown"}'),
  ('generic', 'Generic (Any Agent)', '{"tone": "neutral", "emphasis": "clarity"}', '{"format": "markdown"}'),
  ('custom', 'Custom Agent', '{"tone": "user-defined", "emphasis": "user-defined"}', '{"format": "markdown"}')
on conflict (id) do nothing;

-- Tags table for better tag management
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text default '#6366f1',
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- Custom agents table (user-created agents)
create table if not exists public.custom_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  tone text,
  structure_preference text,
  emphasis text,
  extra_phrase text,
  documentation_url text,
  custom_instructions text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add development_log column to projects if not exists
alter table public.projects
  add column if not exists development_log text[];

-- Enable RLS on new tables
alter table public.tags enable row level security;
alter table public.custom_agents enable row level security;
alter table public.agent_profiles enable row level security;

-- RLS Policies for tags
create policy "Users can view own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can insert own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tags"
  on public.tags for update
  using (auth.uid() = user_id);

create policy "Users can delete own tags"
  on public.tags for delete
  using (auth.uid() = user_id);

-- RLS Policies for custom_agents
create policy "Users can view own custom agents"
  on public.custom_agents for select
  using (auth.uid() = user_id);

create policy "Users can insert own custom agents"
  on public.custom_agents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own custom agents"
  on public.custom_agents for update
  using (auth.uid() = user_id);

create policy "Users can delete own custom agents"
  on public.custom_agents for delete
  using (auth.uid() = user_id);

-- RLS Policy for agent_profiles (read-only for all authenticated users)
create policy "Anyone can view agent profiles"
  on public.agent_profiles for select
  using (true);

-- Add updated_at trigger for custom_agents
create trigger handle_custom_agents_updated_at
  before update on public.custom_agents
  for each row execute function public.handle_updated_at();
