-- Prompt Ops Copilot - Initial Schema
-- Run this in your Supabase SQL editor

-- User settings (1:1 with auth.users)
create table if not exists public.user_settings (
  id uuid primary key references auth.users on delete cascade,
  ai_provider text,
  ai_api_key_encrypted text,
  ai_model text,
  default_mode text default 'quick',
  default_agent text default 'cursor',
  theme text default 'light',
  token_budget text default 'medium',
  linter_strictness text default 'soft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  stack_summary text,
  context_pack text,
  dod_checklist jsonb,
  default_mode text,
  default_agent text,
  constraints_preset jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent profiles (system data, read-only for users)
create table if not exists public.agent_profiles (
  id text primary key,
  name text not null,
  dialect_rules jsonb,
  output_format jsonb
);

-- Prompt templates (system + user-created)
create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  name text not null,
  type text,
  mode_compatibility text[],
  base_structure text,
  placeholders jsonb,
  is_system boolean default false,
  created_at timestamptz default now()
);

-- Prompts (user-generated)
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  project_id uuid references public.projects on delete set null,
  agent_profile_id text references public.agent_profiles,
  template_id uuid references public.prompt_templates on delete set null,
  mode_used text not null,
  input_raw text not null,
  input_language text,
  extracted_fields jsonb,
  output_prompt text not null,
  variant_type text,
  strategy text,
  context_injected text,
  tags text[],
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prompt outcomes
create table if not exists public.prompt_outcomes (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references public.prompts on delete cascade not null,
  worked boolean,
  rating int check (rating >= 1 and rating <= 5),
  notes text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.user_settings enable row level security;
alter table public.projects enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_outcomes enable row level security;

-- RLS Policies for user_settings
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = id);

-- RLS Policies for projects
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- RLS Policies for prompt_templates
create policy "Users can view system templates"
  on public.prompt_templates for select
  using (is_system = true or auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.prompt_templates for insert
  with check (auth.uid() = user_id and is_system = false);

create policy "Users can update own templates"
  on public.prompt_templates for update
  using (auth.uid() = user_id and is_system = false);

create policy "Users can delete own templates"
  on public.prompt_templates for delete
  using (auth.uid() = user_id and is_system = false);

-- RLS Policies for prompts
create policy "Users can view own prompts"
  on public.prompts for select
  using (auth.uid() = user_id);

create policy "Users can insert own prompts"
  on public.prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own prompts"
  on public.prompts for update
  using (auth.uid() = user_id);

create policy "Users can delete own prompts"
  on public.prompts for delete
  using (auth.uid() = user_id);

-- RLS Policies for prompt_outcomes
create policy "Users can view own prompt outcomes"
  on public.prompt_outcomes for select
  using (
    exists (
      select 1 from public.prompts
      where prompts.id = prompt_outcomes.prompt_id
      and prompts.user_id = auth.uid()
    )
  );

create policy "Users can insert own prompt outcomes"
  on public.prompt_outcomes for insert
  with check (
    exists (
      select 1 from public.prompts
      where prompts.id = prompt_outcomes.prompt_id
      and prompts.user_id = auth.uid()
    )
  );

create policy "Users can update own prompt outcomes"
  on public.prompt_outcomes for update
  using (
    exists (
      select 1 from public.prompts
      where prompts.id = prompt_outcomes.prompt_id
      and prompts.user_id = auth.uid()
    )
  );

-- Seed agent profiles
insert into public.agent_profiles (id, name, dialect_rules, output_format) values
  ('cursor', 'Cursor', '{"tone": "technical", "emphasis": "minimal diffs"}', '{"format": "markdown"}'),
  ('lovable', 'Lovable', '{"tone": "ux-focused", "emphasis": "design consistency"}', '{"format": "markdown"}'),
  ('replit', 'Replit', '{"tone": "beginner-friendly", "emphasis": "environment setup"}', '{"format": "markdown"}'),
  ('codex', 'Codex', '{"tone": "methodical", "emphasis": "step-by-step"}', '{"format": "markdown"}')
on conflict (id) do nothing;

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

create trigger handle_projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

create trigger handle_prompts_updated_at
  before update on public.prompts
  for each row execute function public.handle_updated_at();

-- Create function to auto-create user settings on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user settings on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
