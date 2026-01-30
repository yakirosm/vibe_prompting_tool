# Prompt Ops Copilot - Project Status & User Guide

**Last Updated:** January 30, 2026
**Status:** Extended MVP - Major Features Implemented

> **Latest Session (Jan 30, 2026 - Evening):**
> - Implemented Custom Agents feature with full CRUD capabilities
> - Created /app/agents page with search, grid/list views
> - Added AgentCard and AgentFormDialog UI components
> - Integrated custom agents into Target Agent dropdown
> - Updated prompt builder for custom agent dialect generation
> - Added database migration 003 for custom_agents extension

---

## Table of Contents

1. [Current State](#current-state)
2. [What's Been Built](#whats-been-built)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Configuration Guide](#configuration-guide)
6. [Using the Application](#using-the-application)
7. [Database Setup](#database-setup)
8. [What's Next](#whats-next)
9. [Troubleshooting](#troubleshooting)

---

## Current State

### Completed Features

| Feature | Status |
|---------|--------|
| Monorepo setup (pnpm + Turborepo) | ✅ Complete |
| Next.js 15 with App Router | ✅ Complete |
| TypeScript strict mode | ✅ Complete |
| Tailwind CSS + shadcn/ui | ✅ Complete |
| Design system (light/dark themes) | ✅ Complete |
| Shared packages structure | ✅ Complete |
| AI provider abstraction layer | ✅ Complete |
| Composer UI (Quick Convert) | ✅ Complete |
| Landing page | ✅ Complete |
| Auth pages (Login/Signup) | ✅ Complete |
| Supabase integration | ✅ Complete |
| Database schema applied | ✅ Complete |
| Prompt saving API | ✅ Complete |
| Hebrew detection | ✅ Complete |
| Prompt linting | ✅ Complete |
| Provider guidelines (curated) | ✅ Complete |
| **Logout button** | ✅ **NEW** |
| **RTL panel swap** | ✅ **NEW** |
| **Extended agents (11 total)** | ✅ **NEW** |
| **Prompt Library (/app/library)** | ✅ Complete |
| **Project Management** | ✅ Complete |
| **Database migration v2** | ✅ Complete |
| **Custom Agents (/app/agents)** | ✅ **NEW** |
| **Database migration v3** | ✅ **NEW** |

### Not Yet Implemented

- Tag management UI (API ready)
- Project Discovery features
- Smart Form mode
- Wizard mode
- Pro mode
- Google OAuth configuration

---

## What's Been Built

### 1. Core Application (`apps/web`)

A Next.js 15 application with:

- **Landing Page** (`/`) - Marketing page with feature highlights
- **Composer** (`/app`) - Main Quick Convert interface with RTL support
- **Prompt Library** (`/app/library`) - View, search, filter saved prompts
- **Projects** (`/app/projects`) - Project management with context packs
- **Settings** (`/app/settings`) - AI provider configuration
- **Auth** (`/login`, `/signup`) - Authentication pages

### 2. Target Agents

11 supported AI coding agents:

| Agent | Description |
|-------|-------------|
| Cursor | Technical, minimal diffs |
| Lovable | UX-focused, design system |
| Replit | Beginner-friendly, setup focus |
| Codex | Methodical, step-by-step |
| Claude Code | Thoughtful, comprehensive |
| Windsurf | Collaborative, multi-file |
| Bolt | Fast, practical |
| v0 | UI-focused, component-driven |
| Aider | Git-aware, diff-focused |
| Generic | Neutral, any AI tool |
| Custom | User-defined agents (/app/agents) |

### 3. Prompt Library Features

- **Card/List View** - Toggle between grid and list layouts
- **Search** - Full-text search on input and output
- **Filters** - By agent, strategy, favorites
- **Sorting** - By date (newest/oldest), agent
- **Actions** - Copy, favorite toggle, delete
- **Pagination** - Browse large collections

### 4. Project Management

- **Project List** - Card/list view with search
- **Project Detail** - Context pack, development log, prompts
- **Context Pack** - Reusable context injected into prompts
- **Development Log** - Track progress and changes
- **Project Settings** - Default agent, mode, tech stack

### 5. Custom Agents (`/app/agents`)

- **Agent List** - Card/list view with search
- **Create Agent** - Name, description, icon, tone, emphasis
- **Agent Configuration** - Structure preference, key phrase, custom instructions
- **Documentation URL** - Reference docs for the agent
- **Dropdown Integration** - Custom agents appear in Target Agent selector
- **Prompt Generation** - Custom dialect applied during generation

### 6. RTL Support

- Hebrew input automatically detected
- Panels swap: Hebrew input on RIGHT, output on LEFT
- Hebrew UI labels when RTL mode active
- Proper text direction for input field

---

## Project Structure

```
prompt-ops-copilot/
├── apps/
│   └── web/                          # Next.js 15 application
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── (auth)/           # Auth pages
│       │   │   ├── app/
│       │   │   │   ├── page.tsx      # Composer
│       │   │   │   ├── library/      # Prompt Library
│       │   │   │   ├── projects/     # Project Management
│       │   │   │   ├── agents/       # Custom Agents (NEW)
│       │   │   │   └── settings/     # Settings
│       │   │   └── api/
│       │   │       ├── generate/     # AI generation
│       │   │       ├── prompts/      # Prompt CRUD
│       │   │       ├── projects/     # Project CRUD
│       │   │       └── agents/       # Custom Agents CRUD (NEW)
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   ├── composer/         # Composer components
│       │   │   ├── library/          # Library components
│       │   │   ├── projects/         # Project components
│       │   │   ├── agents/           # Agent components (NEW)
│       │   │   └── layout/           # Header, etc.
│       │   ├── hooks/                # Custom hooks (NEW)
│       │   └── lib/
│       │       ├── ai/               # AI provider logic
│       │       └── supabase/         # Supabase clients
│       └── [config files]
│
├── packages/
│   ├── shared/                       # Shared code
│   │   └── src/
│   │       ├── types/                # TypeScript types
│   │       ├── constants/            # Agent dialects, templates
│   │       ├── validators/           # Input validation
│   │       └── utils/                # Hebrew detection, etc.
│   └── db/                           # Database package
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql    # Core tables
│       ├── 002_extended_features.sql # Tags, custom agents
│       └── 003_custom_agents_extension.sql # Custom agents UI (NEW)
│
└── PROJECT_STATUS.md                 # This file
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Supabase account (free tier works)
- AI API key (OpenAI, Anthropic, or Groq)

### Quick Start

```bash
# 1. Navigate to project
cd C:\devprojects\vibe_prompting_tool

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev

# 4. Open in browser
# http://localhost:3000
```

### Available Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Build for production
pnpm type-check   # Run TypeScript checks
pnpm lint         # Run ESLint
```

---

## Configuration Guide

### Environment Variables

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Provider (add at least one)
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

---

## Using the Application

### Composer (`/app`)

1. **Input Panel** - Type or paste your issue description
2. **RTL Auto-Detect** - Hebrew input triggers panel swap
3. **Options Bar** - Select agent, length, strategy
4. **Generate Button** - Click or press `Ctrl/Cmd + Enter`
5. **Output Panel** - View, copy, regenerate, save

### Prompt Library (`/app/library`)

1. **View Mode** - Toggle between card grid and list
2. **Search** - Find prompts by content
3. **Filter** - By agent, strategy, favorites only
4. **Actions** - Copy, favorite, delete prompts

### Projects (`/app/projects`)

1. **Create Project** - Name, description, tech stack
2. **Context Pack** - Add reusable context for prompts
3. **Development Log** - Track progress entries
4. **View Prompts** - See prompts linked to project

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Generate prompt |
| `Tab` | Navigate options |

---

## Database Setup

### Apply Migrations

Run all migrations in Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql` - Core tables
2. `supabase/migrations/002_extended_features.sql` - Extended features
3. `supabase/migrations/003_custom_agents_extension.sql` - Custom agents UI fields

### Tables Overview

| Table | Purpose |
|-------|---------|
| `user_settings` | User preferences, API keys |
| `projects` | User projects with context |
| `prompts` | Saved prompts |
| `prompt_outcomes` | Feedback tracking |
| `agent_profiles` | System agent data (11 agents) |
| `prompt_templates` | System and user templates |
| `tags` | User-defined tags (NEW) |
| `custom_agents` | User-created agents (NEW) |

---

## What's Next

### Immediate Priorities

1. **Tag Management UI** - Create/edit/delete tags, apply to prompts
2. **Project Discovery** - Initial prompt + response parser
3. **Project Selector** - Select project in composer for context injection

### Phase 2 (Remaining)

- [ ] Tag management UI with color picker
- [ ] Project Discovery prompt copy
- [ ] Agent response parser for auto-fill
- [ ] Enable Smart Form mode
- [ ] Enable Wizard mode
- [ ] Enable Pro mode
- [ ] Project selector in composer
- [ ] Context injection from selected project

### Phase 3+ (Future)

- [ ] Mobile app (Expo)
- [ ] Team features
- [ ] Prompt sharing
- [ ] Analytics dashboard

---

## Troubleshooting

### Common Issues

**"No API key configured" Error**
- Add API key to `apps/web/.env.local`
- Restart the dev server

**Build Errors**
```bash
pnpm clean
pnpm install
pnpm build
```

**RTL Not Working**
- Ensure input has at least 10 characters
- Hebrew detection requires Hebrew characters

**Supabase Connection Issues**
- Check environment variables
- Ensure Supabase project is active
- Apply both migrations

---

## Files to Review

| File | Purpose |
|------|---------|
| `apps/web/src/components/composer/composer.tsx` | Main composer with RTL |
| `apps/web/src/app/app/library/page.tsx` | Prompt Library page |
| `apps/web/src/app/app/projects/page.tsx` | Projects list page |
| `apps/web/src/app/app/agents/page.tsx` | Custom Agents page (NEW) |
| `apps/web/src/components/agents/agent-card.tsx` | Agent card component (NEW) |
| `apps/web/src/hooks/use-agent-options.ts` | Agent options hook (NEW) |
| `apps/web/src/components/layout/header.tsx` | Header with navigation |
| `packages/shared/src/constants/agent-dialects.ts` | Agent definitions |
| `packages/shared/src/types/custom-agent.ts` | Custom agent types (NEW) |

---

## Session Summary (Jan 30, 2026 - Evening)

### Completed This Session

- [x] Implemented Custom Agents feature with full CRUD
- [x] Created /app/agents page with search, grid/list views
- [x] Added AgentCard and AgentFormDialog UI components
- [x] Created useAgentOptions hook for dropdown integration
- [x] Integrated custom agents into Target Agent dropdown
- [x] Updated prompt builder for custom agent dialect
- [x] Added database migration 003 for custom_agents extension
- [x] Added Agents navigation link to header

### Files Created/Modified

**New Files:**
- `supabase/migrations/003_custom_agents_extension.sql`
- `packages/shared/src/types/custom-agent.ts`
- `apps/web/src/app/api/agents/route.ts`
- `apps/web/src/app/api/agents/[id]/route.ts`
- `apps/web/src/app/app/agents/page.tsx`
- `apps/web/src/components/agents/agent-card.tsx`
- `apps/web/src/components/agents/agent-form-dialog.tsx`
- `apps/web/src/hooks/use-agent-options.ts`

**Modified Files:**
- `packages/shared/src/types/prompt.ts` - Added BuiltInAgentId, CustomAgentId types
- `packages/shared/src/constants/agent-dialects.ts` - Added getCustomAgentDialectPrompt()
- `packages/shared/src/constants/provider-guidelines/lookup.ts` - Updated for BuiltInAgentId
- `packages/shared/src/validators/prompt-schema.ts` - Support custom agent validation
- `packages/shared/src/index.ts` - Export new types
- `apps/web/src/components/composer/options-bar.tsx` - Custom agents in dropdown
- `apps/web/src/components/layout/header.tsx` - Added Agents nav link
- `apps/web/src/lib/ai/prompt-builder.ts` - Custom agent dialect support
- `apps/web/src/app/api/generate/route.ts` - Fetch custom agent for generation

---

*Generated by Claude Code - Ready to continue when you are!*
