-- Prompt Ops Copilot - Security Fixes
-- Applied after initial_schema to fix security-related issues

-- Ensure handle_new_user function has proper security context
-- This allows the function to insert into user_settings even with RLS enabled
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Note: The trigger on_auth_user_created was already created in initial_schema
-- This migration ensures the function has the correct security definer attribute
