# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Ops Copilot transforms amateur development issues into professional, agent-ready prompts optimized for AI coding tools (Cursor, Lovable, Replit, Codex). Supports Hebrew input with automatic English translation.

## Commands

```bash
# Development
pnpm dev              # Start all workspaces with Turbopack
pnpm build            # Production build
pnpm type-check       # TypeScript checks across all packages
pnpm lint             # ESLint across all packages
pnpm format           # Prettier formatting
pnpm clean            # Remove all node_modules and build artifacts

# Run single package
pnpm --filter @prompt-ops/web dev
pnpm --filter @prompt-ops/shared type-check
```

## Architecture

### Monorepo Structure (pnpm + Turborepo)

- **apps/web** (`@prompt-ops/web`): Next.js 15 App Router application
- **packages/shared** (`@prompt-ops/shared`): Types, constants, validators, utilities
- **packages/db** (`@prompt-ops/db`): Supabase client factory and database types

### AI Provider Abstraction

The AI system uses a pluggable provider pattern in `apps/web/src/lib/ai/`:

- `provider-interface.ts`: `BaseAIProvider` abstract class with OpenAI, Anthropic, and Groq implementations
- `prompt-builder.ts`: Constructs prompts by combining:
  - Core system prompt
  - Provider-specific guidelines (from `@prompt-ops/shared`)
  - Agent dialect (Cursor/Lovable/Replit/Codex targeting)
  - Length/strategy instructions
  - Hebrew language detection

### Prompt Generation Flow

1. User input enters `Composer` component
2. `buildMessages()` constructs AI messages with system prompt containing guidelines injection
3. `createAIProvider()` instantiates appropriate provider
4. `parseGeneratedPrompt()` extracts structured fields (goal, acceptance criteria, etc.)

### Shared Package Exports (`@prompt-ops/shared`)

Key exports used throughout the codebase:
- Types: `PromptGenerationOptions`, `GeneratedPrompt`, `AIProviderConfig`, `AIMessage`
- Constants: `CORE_SYSTEM_PROMPT`, `LENGTH_INSTRUCTIONS`, `STRATEGY_INSTRUCTIONS`
- Functions: `getAgentDialectPrompt()`, `lookupGuidelines()`, `detectInputLanguage()`
- Provider guidelines: `packages/shared/src/constants/provider-guidelines/`

### Database Schema (Supabase)

Schema in `supabase/migrations/001_initial_schema.sql`:
- `user_settings`: AI provider config, preferences (1:1 with auth.users)
- `projects`: User projects with context packs
- `prompts`: Generated prompts with metadata
- `prompt_outcomes`: Rating/feedback tracking
- `agent_profiles`: System data for targeting agents (Cursor, Lovable, etc.)

All tables use Row Level Security with policies scoped to `auth.uid()`.

## Environment Setup

Copy `apps/web/.env.example` to `apps/web/.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase credentials
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`: AI provider key

The app works without Supabase for testing (auth/saving disabled, composer functional).

## Key Files

- `apps/web/src/components/composer/composer.tsx`: Main UI orchestrator
- `apps/web/src/lib/ai/prompt-builder.ts`: Prompt construction logic
- `apps/web/src/lib/ai/provider-interface.ts`: AI provider implementations
- `packages/shared/src/constants/agent-dialects.ts`: Agent-specific prompt rules
- `packages/shared/src/constants/provider-guidelines/`: Curated AI guidelines (OpenAI, Anthropic, Google, Cursor, Lovable, Replit)
