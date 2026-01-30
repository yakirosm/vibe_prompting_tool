-- Prompt Ops Copilot - Custom Tweaks Migration
-- Adds custom_tweaks table for user-created prompt tweaks

create table if not exists public.custom_tweaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  short_name text not null,
  instruction text not null,
  description text,
  category text default 'custom' check (category in ('skill', 'behavior', 'custom')),
  icon text default 'sparkles',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.custom_tweaks enable row level security;

-- RLS Policies for custom_tweaks
create policy "Users can view own custom tweaks"
  on public.custom_tweaks for select
  using (auth.uid() = user_id);

create policy "Users can insert own custom tweaks"
  on public.custom_tweaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own custom tweaks"
  on public.custom_tweaks for update
  using (auth.uid() = user_id);

create policy "Users can delete own custom tweaks"
  on public.custom_tweaks for delete
  using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger handle_custom_tweaks_updated_at
  before update on public.custom_tweaks
  for each row execute function public.handle_updated_at();

-- Add comments for documentation
comment on table public.custom_tweaks is 'User-created custom tweaks/modifiers for prompt generation';
comment on column public.custom_tweaks.name is 'Full name of the tweak';
comment on column public.custom_tweaks.short_name is 'Short display name for tag/chip display (2-15 chars)';
comment on column public.custom_tweaks.instruction is 'The instruction text that gets injected into the prompt';
comment on column public.custom_tweaks.description is 'User-friendly description of what this tweak does';
comment on column public.custom_tweaks.category is 'Category: skill, behavior, or custom';
comment on column public.custom_tweaks.icon is 'Emoji or icon identifier for the tweak';
