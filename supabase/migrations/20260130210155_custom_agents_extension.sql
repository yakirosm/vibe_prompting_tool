-- Prompt Ops Copilot - Custom Agents Extension
-- Adds description and icon columns to custom_agents table

ALTER TABLE public.custom_agents
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS icon text DEFAULT 'bot';

-- Add comment for documentation
COMMENT ON COLUMN public.custom_agents.description IS 'User-provided description of the custom agent';
COMMENT ON COLUMN public.custom_agents.icon IS 'Icon identifier for the custom agent (e.g., bot, sparkles, zap)';
