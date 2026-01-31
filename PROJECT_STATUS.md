# Prompt Ops Copilot - Project Status & User Guide

**Last Updated:** January 31, 2026
**Status:** Extended MVP - Major Features Implemented

> **Latest Session (Jan 31, 2026):**
> - **Tag Usage Count** - Tags display usage count ("X prompts")
> - **Delete Warning** - Shows affected prompt count before deleting
> - **Tag Sorting** - Sort by name, usage, or date (6 options)
> - **Tag Search in Dropdowns** - Search filter when >5 tags exist
> - **Bulk Tag Operations** - Select multiple prompts, add/remove tags at once

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
| **Custom Agents (/app/agents)** | ✅ Complete |
| **Database migration v3** | ✅ Complete |
| **Tag Management (/app/tags)** | ✅ Complete |
| **Tag-Prompt Integration** | ✅ Complete |
| **Composer Tag Selection** | ✅ Complete |
| **Tag Usage Count & Sorting** | ✅ **NEW** |
| **Tag Search in Dropdowns** | ✅ **NEW** |
| **Bulk Tag Operations** | ✅ **NEW** |

### Not Yet Implemented

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
- **Composer** (`/app`) - Main Quick Convert interface with RTL support and tag selection
- **Prompt Library** (`/app/library`) - View, search, filter saved prompts with tag support
- **Projects** (`/app/projects`) - Project management with context packs
- **Tags** (`/app/tags`) - Tag management with color picker
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
- **Filters** - By agent, strategy, favorites, tags
- **Sorting** - By date (newest/oldest), agent
- **Actions** - Copy, favorite toggle, delete, manage tags
- **Pagination** - Browse large collections
- **Tag Badges** - Colored tags displayed on prompt cards
- **Selection Mode** - Select multiple prompts for bulk operations
- **Bulk Tag Operations** - Add/remove tags from multiple prompts at once

### 4. Tag Management (`/app/tags`)

- **Tag List** - Card/list view with search
- **Create/Edit Tags** - Name and color picker (10 preset colors)
- **Delete Tags** - With confirmation dialog and usage warning
- **Usage Count** - Display how many prompts use each tag
- **Sorting** - Sort by name (A-Z/Z-A), usage (most/least), date (newest/oldest)
- **Apply to Prompts** - Via Library "Manage Tags" or Composer
- **Filter by Tags** - Multi-select tag filter in Library
- **Composer Integration** - Add tags when creating prompts
- **Inline Creation** - Create new tags without leaving Composer
- **Search in Dropdowns** - Filter tags when many exist (>5 tags)
- **Bulk Operations** - Select multiple prompts, add/remove tags at once

### 5. Project Management

- **Project List** - Card/list view with search
- **Project Detail** - Context pack, development log, prompts
- **Context Pack** - Reusable context injected into prompts
- **Development Log** - Track progress and changes
- **Project Settings** - Default agent, mode, tech stack

### 6. Custom Agents (`/app/agents`)

- **Agent List** - Card/list view with search
- **Create Agent** - Name, description, icon, tone, emphasis
- **Agent Configuration** - Structure preference, key phrase, custom instructions
- **Documentation URL** - Reference docs for the agent
- **Dropdown Integration** - Custom agents appear in Target Agent selector
- **Prompt Generation** - Custom dialect applied during generation

### 7. RTL Support

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
│       │   │   │   ├── agents/       # Custom Agents
│       │   │   │   ├── tags/         # Tag Management (NEW)
│       │   │   │   └── settings/     # Settings
│       │   │   └── api/
│       │   │       ├── generate/     # AI generation
│       │   │       ├── prompts/      # Prompt CRUD + bulk operations
│       │   │       ├── projects/     # Project CRUD
│       │   │       ├── agents/       # Custom Agents CRUD
│       │   │       └── tags/         # Tags CRUD
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   ├── composer/         # Composer components
│       │   │   ├── library/          # Library components
│       │   │   ├── projects/         # Project components
│       │   │   ├── agents/           # Agent components
│       │   │   ├── tags/             # Tag components (NEW)
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

1. **Project Discovery** - Initial prompt + response parser
2. **Project Selector** - Select project in composer for context injection
3. **Context Injection** - Auto-inject project context into prompts

### Phase 2 (Remaining)

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
| `apps/web/src/components/composer/composer.tsx` | Main composer with RTL and tags |
| `apps/web/src/components/composer/output-panel.tsx` | Output panel with tag selector and search |
| `apps/web/src/app/app/library/page.tsx` | Prompt Library with tag filtering and bulk operations |
| `apps/web/src/app/app/projects/page.tsx` | Projects list page |
| `apps/web/src/app/app/agents/page.tsx` | Custom Agents page |
| `apps/web/src/app/app/tags/page.tsx` | Tag Management with sorting |
| `apps/web/src/components/tags/tag-card.tsx` | Tag card with usage count |
| `apps/web/src/components/tags/tag-form-dialog.tsx` | Tag form with color picker |
| `apps/web/src/components/library/tag-selector-dialog.tsx` | Tag selector with search |
| `apps/web/src/components/library/bulk-action-bar.tsx` | Bulk selection action bar (NEW) |
| `apps/web/src/components/library/bulk-tag-dialog.tsx` | Bulk tag operations dialog (NEW) |
| `apps/web/src/app/api/prompts/bulk/route.ts` | Bulk tag update API (NEW) |
| `apps/web/src/components/layout/header.tsx` | Header with navigation |
| `packages/shared/src/types/tag.ts` | Tag type with usage_count |

---

## Session Summary (Jan 31, 2026 - Continued)

### Completed This Session - Tag Features Completion

- [x] **Tag Usage Count** - Tags display how many prompts use them
- [x] **Delete Warning** - Shows affected prompt count before deletion
- [x] **Tag Sorting** - 6 sort options (name A-Z/Z-A, usage most/least, date newest/oldest)
- [x] **Tag Search in Dropdowns** - Filter tags in library filters, tag selector dialog, composer
- [x] **Bulk Tag Operations** - Select multiple prompts, add/remove tags at once
- [x] **Selection Mode** - Toggle selection mode in library with "Select" button
- [x] **Bulk Action Bar** - Floating action bar when prompts are selected
- [x] **Checkbox Component** - New shadcn/ui checkbox component

### Files Created

- `apps/web/src/components/ui/checkbox.tsx` - Checkbox UI component
- `apps/web/src/app/api/prompts/bulk/route.ts` - Bulk tag update endpoint
- `apps/web/src/components/library/bulk-action-bar.tsx` - Selection action bar
- `apps/web/src/components/library/bulk-tag-dialog.tsx` - Bulk tag selector dialog

### Files Modified

- `packages/shared/src/types/tag.ts` - Added usage_count field
- `apps/web/src/app/api/tags/route.ts` - Usage count calculation, sorting params
- `apps/web/src/app/app/tags/page.tsx` - Sort dropdown, delete warning with usage
- `apps/web/src/components/tags/tag-card.tsx` - Display usage count
- `apps/web/src/components/library/library-filters.tsx` - Tag search in dropdown
- `apps/web/src/components/library/tag-selector-dialog.tsx` - Tag search input
- `apps/web/src/components/composer/output-panel.tsx` - Tag search in dropdown
- `apps/web/src/components/library/prompt-card.tsx` - Selection checkbox
- `apps/web/src/app/app/library/page.tsx` - Selection state, bulk operations
- `apps/web/package.json` - Added @radix-ui/react-checkbox

---

## Previous Session (Jan 31, 2026 - Morning)

### Completed - Tag Management Base

- [x] Implemented Tag Management UI with full CRUD
- [x] Created /app/tags page with search, grid/list views
- [x] Added TagCard and TagFormDialog UI components with color picker
- [x] Added tag filtering to Prompt Library (multi-select)
- [x] Display colored tag badges on prompt cards
- [x] Added "Manage Tags" feature to apply/remove tags on prompts
- [x] Added tag selection to Composer output panel
- [x] Inline tag creation in Composer (create new tags without leaving page)
- [x] Added Tags navigation link to header

---

## Previous Session (Jan 30, 2026 - Evening)

### Completed

- [x] Implemented Custom Agents feature with full CRUD
- [x] Created /app/agents page with search, grid/list views
- [x] Added AgentCard and AgentFormDialog UI components
- [x] Integrated custom agents into Target Agent dropdown
- [x] Added database migration 003 for custom_agents extension

---

*Generated by Claude Code - Ready to continue when you are!*
