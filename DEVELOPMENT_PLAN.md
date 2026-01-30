# Prompt Ops Copilot — Development Plan

## Executive Summary

A web app that transforms "amateur" natural-language development issues into professional, agent-ready English prompts—optimized for AI coding tools (Cursor, Lovable, Replit, Codex).

**Key Decisions:**
- Web-first (Next.js 15), mobile later (Expo)
- Supabase for auth, DB, realtime, storage
- Pluggable AI backend (user provides their own API key)
- Hebrew → English translation is MVP must-have
- Phased MVP: Quick Convert mode first, add other modes incrementally
- Google + monday.com design aesthetic (light theme default, dark mode toggle)
- **Development methodology: Get Shit Done (GSD)** for spec-driven, context-aware building

---

## 0. Development Methodology: Get Shit Done (GSD)

We'll use [GSD](https://github.com/glittercowboy/get-shit-done) as our development framework.

### Why GSD?
- **Context management**: Fresh 200k-token context per task prevents quality degradation
- **Spec-driven**: Forces clear requirements before implementation
- **Atomic commits**: Clean git history with semantic versioning
- **Verification loops**: Built-in user acceptance testing per task

### GSD Workflow
```
Initialize → Discuss → Plan → Execute → Verify
```

1. **Initialize**: `npx get-shit-done-cc` in project root
2. **Discuss**: Define phase scope, constraints, decisions
3. **Plan**: Research → Tasks → Verification criteria
4. **Execute**: One task at a time, fresh context each
5. **Verify**: UAT before marking complete

### Project Structure (GSD-managed)
```
/
├── .planning/
│   ├── config.json           # GSD configuration
│   ├── research/             # Research artifacts
│   ├── quick/                # Ad-hoc task docs
│   └── phase-*.md            # Phase documentation
├── PROJECT.md                # Auto-generated project overview
├── REQUIREMENTS.md           # Requirements spec
├── ROADMAP.md                # Milestone roadmap
├── STATE.md                  # Current project state
└── /apps, /packages, etc.    # Actual code
```

### GSD + Our Phases Mapping
| Our Phase | GSD Phase | Deliverable |
|-----------|-----------|-------------|
| Phase 0: Foundation | Phase 1 | Monorepo, auth, design tokens |
| Phase 1: MVP | Phase 2 | Quick Convert mode |
| Phase 2: v1 | Phase 3 | Smart Form, Library |
| Phase 3: v1.5 | Phase 4 | Wizard, Polish |
| Phase 4: v2 | Phase 5 | Pro Mode, Mobile |

---

## 1. UI/UX & Wireframes

### Composer Layout (Quick Convert Mode)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header                                                                │
│ [Logo]              [Project ▼]    [Mode: Quick ▼]    [⚙️] [🌙]      │
├───────────────────────────────────┬──────────────────────────────────┤
│ INPUT                             │ OUTPUT                           │
│ ┌─────────────────────────────┐   │ ┌──────────────────────────────┐ │
│ │                             │   │ │ [Standard] [Short] [Detail] │ │
│ │ Describe your issue...      │   │ ├──────────────────────────────┤ │
│ │                             │   │ │                              │ │
│ │ (Hebrew or English)         │   │ │ **Goal:** ...                │ │
│ │                             │   │ │ **Context:** ...             │ │
│ │                             │   │ │ **Current:** ...             │ │
│ │                             │   │ │ **Expected:** ...            │ │
│ └─────────────────────────────┘   │ │ **AC:** ...                  │ │
│                                   │ │ **Constraints:** ...         │ │
│ ┌─────────────────────────────┐   │ │                              │ │
│ │ Agent: [Cursor ▼]           │   │ └──────────────────────────────┘ │
│ │ Length: ○ Short ● Std ○ Det │   │                                  │
│ │ Strategy: ● Implement ○ Diag│   │ ⚠️ Missing: expected outcome     │
│ │ □ Ask clarifying questions  │   │    [+ Add]                       │
│ └─────────────────────────────┘   │                                  │
│                                   │ [📋 Copy]  [💾 Save]  [↻ Regen]  │
│ [✨ Generate]                     │                                  │
└───────────────────────────────────┴──────────────────────────────────┘
```

### Responsive Behavior
- **Desktop (>1024px):** 50/50 split, side-by-side
- **Tablet (768-1024px):** 40/60 split, input narrower
- **Mobile (<768px):** Stacked, input on top, output below
- **Options bar:** Collapses to icon buttons on mobile

### Key UX Patterns
- Linter hints appear inline, dismissible, one-click fix
- Output tabs allow quick variant comparison
- Copy button is prominent (primary action post-generate)
- Auto-save draft to localStorage every 10 seconds
- Keyboard shortcut: Cmd/Ctrl+Enter to generate

---

## 2. Recommended Tech Stack

### Core Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 15 (App Router) | SSR for landing pages, React ecosystem, TypeScript native |
| **Styling** | Tailwind CSS + shadcn/ui | Matches design goals, accessible components, easy theming |
| **Backend** | Supabase (Edge Functions) | All-in-one: auth, DB, realtime, storage. Reduces complexity |
| **Database** | Supabase PostgreSQL | Row-level security, realtime subscriptions, JSON columns |
| **Auth** | Supabase Auth | Built-in, supports OAuth (Google, GitHub, Apple) |
| **AI Layer** | Abstracted provider interface | User configures: OpenAI, Claude, Groq, Ollama, etc. |
| **Offline/Sync** | Supabase Realtime + custom sync queue | IndexedDB for local cache, conflict resolution on merge |
| **Deployment** | Vercel (web) | Optimal for Next.js, edge functions, preview deploys |
| **Mobile (v2)** | Expo + React Native | Code sharing via shared packages, same Supabase backend |

### Monorepo Structure
```
/apps
  /web          → Next.js 15 app
  /mobile       → Expo app (v2)
/packages
  /shared       → Types, validators, constants, AI provider interface
  /ui           → Shared design tokens (colors, spacing, typography)
  /db           → Supabase client, queries, sync logic
```

**Tooling:** pnpm workspaces, Turborepo, TypeScript strict mode

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  Landing Pages (SSR)  │  App Shell (CSR)  │  Auth Pages     │
├───────────────────────┴───────────────────┴─────────────────┤
│                     State Management                         │
│         Zustand (global) + React Query (server state)       │
├─────────────────────────────────────────────────────────────┤
│                     Offline Layer                            │
│      IndexedDB (Dexie.js) ←→ Sync Queue ←→ Supabase        │
├─────────────────────────────────────────────────────────────┤
│                     Supabase Backend                         │
│  Auth │ PostgreSQL │ Realtime │ Edge Functions │ Storage    │
├─────────────────────────────────────────────────────────────┤
│                     AI Provider Layer                        │
│  Edge Function proxies to user-configured AI provider       │
│  (OpenAI / Claude / Groq / Ollama / etc.)                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **AI Provider Abstraction**: Edge function accepts `{provider, apiKey, model}` from user settings. Proxies to appropriate API. Never stores API keys server-side (encrypt in user's browser, decrypt on edge).

2. **Offline Strategy**:
   - IndexedDB stores: prompts, projects, templates (encrypted)
   - Sync queue tracks pending changes with timestamps
   - On reconnect: push queue, pull changes, merge with last-write-wins + conflict UI for edge cases

3. **Realtime**: Supabase Realtime subscriptions for `prompts` and `projects` tables. Changes propagate to all connected clients.

---

## 3. Phased Roadmap

### Phase 0: Foundation (Week 1-2)
- [ ] Monorepo setup (pnpm + Turborepo)
- [ ] Next.js 15 with App Router
- [ ] Supabase project + auth setup
- [ ] Design system tokens + base components
- [ ] AI provider abstraction layer
- [ ] Basic landing page (SEO)

### Phase 1: MVP — Quick Convert Mode (Week 3-5)
- [ ] Core composer: input → AI → output
- [ ] Agent target selector (Cursor/Lovable/Replit/Codex)
- [ ] Output options (Short/Standard/Detailed, Implement/Diagnose)
- [ ] Hebrew detection + translation
- [ ] Copy to clipboard (with formatting)
- [ ] Basic prompt saving (local + cloud)
- [ ] Prompt linter (soft suggestions)
- [ ] Settings: AI provider configuration
- [ ] Light/dark theme toggle

### Phase 2: v1 — Smart Form + Library (Week 6-8)
- [ ] Mode B: Smart Form (auto-extracted fields)
- [ ] Projects with context packs
- [ ] Prompt library (history, tags, favorites)
- [ ] Presets library (10 core presets)
- [ ] Acceptance criteria builder
- [ ] Prompt variants (generate 2-3 options)
- [ ] Outcome tracking (worked/didn't)
- [ ] Full offline support + sync

### Phase 3: v1.5 — Wizard + Polish (Week 9-10)
- [ ] Mode C: Guided Wizard (3-5 steps)
- [ ] Prompt packs (multi-step workflows)
- [ ] Risk flags (auth/payment/migration)
- [ ] Context budget indicator
- [ ] Improved onboarding flow

### Phase 4: v2 — Pro Mode + Mobile (Week 11-14)
- [ ] Mode D: Pro Split View
- [ ] Mobile app (Expo) with shared logic
- [ ] Team features (shared templates, playbooks)
- [ ] Learning from outcomes (suggest best templates)
- [ ] Artifact attachments (logs, snippets)

---

## 4. Screen List by Phase

### MVP Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Landing | `/` | Marketing page, value prop, CTA |
| Login | `/login` | Supabase auth (email + OAuth) |
| Signup | `/signup` | Registration flow |
| Composer | `/app` | Main Quick Convert interface |
| Settings | `/app/settings` | AI provider config, theme, preferences |

### v1 Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Projects | `/app/projects` | Project list + create |
| Project Detail | `/app/projects/[id]` | Context pack, defaults, constraints |
| Library | `/app/library` | Saved prompts, filters, search |
| Prompt Detail | `/app/library/[id]` | View prompt, outcome, variants |
| Templates | `/app/templates` | Browse/search templates |
| Presets | `/app/presets` | Browse/search presets |

### v2 Screens
| Screen | Route | Description |
|--------|-------|-------------|
| Wizard | `/app/wizard` | Step-by-step prompt builder |
| Pro View | `/app/pro` | Split view composer |
| Team | `/app/team` | Team management (v2+) |

---

## 5. Core User Flows

### Flow 1: Quick Convert (MVP)
```
1. User lands on /app (Composer)
2. Pastes issue in textarea (Hebrew or English)
3. Selects: Agent target, Length, Strategy
4. Clicks "Generate"
5. AI processes → output appears
6. User reviews linter suggestions (optional fixes)
7. Clicks "Copy" → prompt in clipboard
8. (Optional) Clicks "Save" → stored in library
```

### Flow 2: Smart Form (v1)
```
1. User pastes free text in Mode B
2. Clicks "Extract Fields"
3. AI parses → form appears with prefilled fields
   - Problem, Expected, Scope, Area, Constraints
   - Each field labeled "Auto-extracted" or "Confirmed"
4. User reviews/edits fields
5. Clicks "Generate Prompt"
6. Output appears → Copy/Save
```

### Flow 3: Project Context (v1)
```
1. User goes to /app/projects → "New Project"
2. Fills: name, stack summary, context pack (5-10 lines)
3. Sets: default mode, default agent, constraints preset
4. Saves project
5. In Composer, selects project from dropdown
6. Context pack auto-injects into prompts (visible)
```

### Flow 4: Prompt Library (v1)
```
1. User goes to /app/library
2. Sees saved prompts with filters:
   - Project, Agent, Tag, Outcome, Date
3. Clicks prompt → sees detail:
   - Original input, generated output, variant used
4. Can: re-use, edit input + regenerate, mark outcome
```

---

## 6. Data Model (Refined)

### Tables

```sql
-- User settings (1:1 with auth.users)
create table user_settings (
  id uuid primary key references auth.users,
  ai_provider text, -- 'openai' | 'claude' | 'groq' | 'ollama' | 'custom'
  ai_api_key_encrypted text, -- encrypted with user's key
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
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  stack_summary text, -- short tech stack
  context_pack text, -- injectable context (5-10 lines)
  dod_checklist jsonb, -- array of checklist items
  default_mode text,
  default_agent text,
  constraints_preset jsonb, -- checkbox config
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent profiles (system data, read-only for users)
create table agent_profiles (
  id text primary key, -- 'cursor' | 'lovable' | 'replit' | 'codex'
  name text not null,
  dialect_rules jsonb, -- how to phrase
  output_format jsonb -- structure overrides
);

-- Provider guidelines (official best practices - system data)
create table provider_guidelines (
  id text primary key, -- 'openai' | 'anthropic' | 'google' | 'cursor' | 'lovable' | 'replit'
  name text not null,
  documentation_url text,
  guidelines jsonb not null, -- structured guidelines array
  prompt_injection text, -- text to inject into system prompt
  last_reviewed_at timestamptz,
  version text -- track doc version
);

-- Example guidelines structure:
-- {
--   "principles": ["Be specific", "Use delimiters", "Provide examples"],
--   "structure_rules": ["Use XML tags for Claude", "Use markdown for GPT"],
--   "avoid": ["Vague instructions", "Overly long context"],
--   "prompt_patterns": ["Role assignment", "Chain of thought"]
-- }

-- Prompt templates (system + user-created)
create table prompt_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users, -- null = system template
  name text not null,
  type text, -- 'bug' | 'feature' | 'refactor' | 'performance' | 'tests'
  mode_compatibility text[], -- which modes can use this
  base_structure text, -- template skeleton
  placeholders jsonb, -- expected fields
  is_system boolean default false,
  created_at timestamptz default now()
);

-- Presets (system data)
create table presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  acceptance_criteria jsonb, -- array of bullets
  suggested_constraints jsonb,
  tags text[]
);

-- Prompts (user-generated)
create table prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  project_id uuid references projects,
  agent_profile_id text references agent_profiles,
  template_id uuid references prompt_templates,
  mode_used text not null,
  input_raw text not null,
  input_language text, -- 'he' | 'en'
  extracted_fields jsonb, -- for Smart Form mode
  output_prompt text not null,
  variant_type text, -- 'short' | 'standard' | 'detailed'
  strategy text, -- 'implement' | 'diagnose'
  context_injected text, -- what project context was added
  tags text[],
  is_favorite boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Prompt outcomes
create table prompt_outcomes (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references prompts not null,
  worked boolean,
  rating int check (rating >= 1 and rating <= 5),
  notes text,
  created_at timestamptz default now()
);

-- Sync queue (for offline support)
create table sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  table_name text not null,
  record_id uuid not null,
  operation text not null, -- 'insert' | 'update' | 'delete'
  payload jsonb not null,
  created_at timestamptz default now(),
  synced_at timestamptz
);
```

---

## 7. Design System

### Color Tokens

```css
/* Light Theme (default) */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f8f9fa;
--color-bg-tertiary: #f1f3f4;
--color-text-primary: #202124;
--color-text-secondary: #5f6368;
--color-text-muted: #9aa0a6;
--color-border: #dadce0;
--color-border-focus: #1a73e8;

/* Accent Colors */
--color-accent-blue: #1a73e8;      /* Primary actions, links, focus */
--color-accent-blue-hover: #1557b0;
--color-accent-green: #34a853;     /* Success states */
--color-accent-red: #ea4335;       /* Errors, destructive */
--color-accent-yellow: #fbbc04;    /* Warnings */

/* Dark Theme */
--color-bg-primary-dark: #1e1e1e;
--color-bg-secondary-dark: #252526;
--color-bg-tertiary-dark: #2d2d2d;
--color-text-primary-dark: #e8eaed;
--color-text-secondary-dark: #9aa0a6;
--color-border-dark: #3c4043;
```

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Typography
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Border Radius
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.07);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-focus: 0 0 0 3px rgba(26,115,232,0.15);
```

### Core Components (shadcn/ui customized)
- Button (primary, secondary, ghost, destructive)
- Input, Textarea (with validation states)
- Select, Dropdown (agent selector, project picker)
- Card (prompt output, project card, template card)
- Tabs (mode selector, variant tabs)
- Toast (success, error, warning)
- Modal (settings, save prompt, confirm)
- Toggle (theme switch, clarify-first)
- Badge (auto-extracted, confirmed, tags)
- Empty State (no prompts, no projects)
- Loading State (skeleton, spinner)

### Component Specifications

#### Button
```tsx
// Variants
<Button variant="primary">Generate</Button>   // Blue bg, white text
<Button variant="secondary">Save</Button>      // White bg, blue text/border
<Button variant="ghost">Cancel</Button>        // Transparent, gray text
<Button variant="destructive">Delete</Button>  // Red bg

// Sizes: sm (32px), md (40px default), lg (48px)

// States
- Default: bg-accent-blue
- Hover: bg-accent-blue-hover + shadow-md
- Active: scale(0.98)
- Disabled: opacity-50, cursor-not-allowed
- Loading: spinner replaces text, aria-busy="true"
```

#### Textarea (Main Input)
```tsx
<div className="relative">
  <textarea
    className="w-full min-h-[200px] p-4 border border-border rounded-lg
               focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20
               resize-y"
    placeholder="Describe your issue (Hebrew or English)..."
  />
  <div className="absolute bottom-3 right-3 text-text-muted text-sm">
    {charCount}/5000
  </div>
</div>
```

#### Card (Output Panel)
```tsx
<div className="bg-bg-primary border border-border rounded-xl shadow-sm overflow-hidden">
  <div className="border-b border-border px-4 py-2 flex gap-2">
    <Tab active>Standard</Tab>
    <Tab>Short</Tab>
    <Tab>Detailed</Tab>
  </div>
  <div className="p-4 font-mono text-sm whitespace-pre-wrap">{output}</div>
  <div className="border-t border-border px-4 py-3 flex justify-end gap-2">
    <Button variant="ghost" size="sm">↻ Regenerate</Button>
    <Button variant="secondary" size="sm">💾 Save</Button>
    <Button variant="primary" size="sm">📋 Copy</Button>
  </div>
</div>
```

#### Toast Notifications
```tsx
// Position: bottom-right, slides up, 3s auto-dismiss
// Success: bg-green-50, border-green-200, text-green-800
// Error: bg-red-50, border-red-200, text-red-800
// Info: bg-blue-50, border-blue-200, text-blue-800
```

### Accessibility Patterns
```tsx
// Focus management
- Visible focus rings (shadow-focus)
- Skip-to-content link
- Focus trap in modals

// ARIA
- aria-busy on loading buttons
- aria-live="polite" on output panel
- aria-describedby for error messages
- role="alert" on toasts

// Keyboard
- Enter/Space on all interactive elements
- Escape to close modals/dropdowns
- Tab order follows visual order
- Arrow keys in dropdown menus

// Motion preference
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

---

## 8. AI Prompt Engineering

### Official Guidelines Integration

The app uses **curated official documentation** from AI providers to generate prompts that follow proven best practices.

**Sources (MVP - Static Curated):**
| Provider | Documentation | Key Guidelines |
|----------|---------------|----------------|
| OpenAI | [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) | Be specific, use delimiters, provide examples, specify output format |
| Anthropic | [Claude Prompt Engineering](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) | Clear instructions, XML tags, chain of thought, role assignment |
| Google | [Gemini Prompting Guide](https://ai.google.dev/gemini-api/docs/prompting-intro) | Task-focused, iterative refinement, grounding |
| Cursor | Tool-specific docs | File references, codebase context, minimal diffs |
| Lovable | Tool-specific docs | UI/UX focus, design system adherence |
| Replit | Tool-specific docs | Environment setup, how to run/verify |

**How Guidelines Are Applied:**
1. Guidelines stored as structured data in `provider_guidelines` table
2. When generating, relevant guidelines are injected into the system prompt
3. User sees the high-quality output (guidelines work behind the scenes)
4. Guidelines updated manually when providers publish changes

**Example Guideline Application:**
```
User selects: Agent = "Cursor", Provider = "Claude"

Applied guidelines:
- Anthropic: Use XML tags for structure, be explicit about constraints
- Cursor: Include file paths, emphasize minimal diffs, keep tests green
```

### Transformation Pipeline
```
User Input → Language Detection → Translation (if Hebrew) →
Guidelines Lookup → Field Extraction → Template Selection →
Dialect Application → Linting → Output Generation → Variants
```

### Core System Prompt

```
You are a prompt engineering assistant that transforms amateur
development requests into professional, agent-ready prompts.

INPUT: A user's description of a coding task (may be in Hebrew or English)
OUTPUT: A structured English prompt optimized for AI coding assistants

RULES:
1. Always output in English, regardless of input language
2. Use this exact structure:
   - Goal: What needs to be accomplished (1 sentence)
   - Context: Project/tech context (only if provided)
   - Current behavior: What's happening now (for bugs)
   - Expected behavior: What should happen
   - Acceptance criteria: 3-5 bullet points
   - Constraints: Limitations or requirements
   - If unclear, ask: 2-4 clarifying questions (only if enabled)

3. Be concise—every word must add value
4. Avoid vague language ("improve", "fix", "make better")
5. Use specific, actionable language

AGENT DIALECT: {agent}
- Cursor: Emphasize file paths, minimal diffs, keep tests green
- Lovable: Emphasize UX behavior, UI consistency, design system
- Replit: Include how to run/verify, environment setup
- Codex: Step-by-step implementation plan, explicit ordering

LENGTH: {length}
- Short: Goal + 2-4 AC bullets only
- Standard: Full structure
- Detailed: Add edge cases, test notes, accessibility

STRATEGY: {strategy}
- Implement: Assume details, proceed with minimal safe implementation
- Diagnose: Request confirmation steps + root cause before implementing
```

### Hebrew Detection

```typescript
function detectHebrew(text: string): boolean {
  const hebrewChars = (text.match(/[\u0590-\u05FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 && hebrewChars / totalChars > 0.3;
}
```

### Agent Dialect Matrix

| Aspect | Cursor | Lovable | Replit | Codex |
|--------|--------|---------|--------|-------|
| Tone | Technical, minimal | UX-focused | Beginner-friendly | Methodical |
| Structure | Files → Changes | User story → UI | Setup → Verify | Steps 1,2,3 |
| Emphasis | Diff size, tests | Design consistency | Environment | Order of ops |
| Extra phrase | "Keep changes minimal" | "Match existing UI" | "How to run" | "First...then..." |

---

## 9. Prioritized Backlog (MVP Tasks)

### Epic 1: Project Setup
- [ ] Initialize monorepo with pnpm + Turborepo
- [ ] Setup Next.js 15 with App Router
- [ ] Configure TypeScript strict mode
- [ ] Setup Tailwind CSS + shadcn/ui
- [ ] Create Supabase project
- [ ] Configure Supabase auth (email + Google OAuth)
- [ ] Setup environment variables
- [ ] Create shared packages structure

### Epic 2: Design System Foundation
- [ ] Create theme provider (light/dark)
- [ ] Define CSS variables for tokens
- [ ] Customize shadcn/ui components
- [ ] Build Button variants
- [ ] Build Input/Textarea with states
- [ ] Build Card component
- [ ] Build Toast notifications
- [ ] Build Modal component

### Epic 3: Auth Flow
- [ ] Create login page
- [ ] Create signup page
- [ ] Implement Supabase auth hooks
- [ ] Add Google OAuth button
- [ ] Create protected route wrapper
- [ ] Build auth loading states

### Epic 4: AI Provider Layer
- [ ] Define provider interface (types)
- [ ] Create OpenAI adapter
- [ ] Create Claude adapter
- [ ] Create edge function proxy
- [ ] Build settings UI for API key config
- [ ] Encrypt API key in browser storage

### Epic 5: Composer (Quick Convert)
- [ ] Build composer layout (input left, output right)
- [ ] Create main textarea with Hebrew/English detection
- [ ] Build agent target dropdown
- [ ] Build length toggle (Short/Standard/Detailed)
- [ ] Build strategy toggle (Implement/Diagnose)
- [ ] Build clarify-first toggle
- [ ] Create "Generate" button with loading state
- [ ] Build output display panel
- [ ] Add copy button (with toast feedback)
- [ ] Build linter suggestions component

### Epic 6: Prompt Generation
- [ ] Create prompt template system
- [ ] Build agent dialect rules
- [ ] Implement Hebrew detection (simple heuristic)
- [ ] Implement translation prompt
- [ ] Build prompt assembly logic
- [ ] Create canonical output format
- [ ] Implement variant generation

### Epic 6.5: Official Guidelines Integration
- [ ] Curate OpenAI prompt engineering guidelines
- [ ] Curate Anthropic/Claude guidelines
- [ ] Curate Google/Gemini guidelines
- [ ] Curate Cursor-specific guidelines
- [ ] Curate Lovable-specific guidelines
- [ ] Curate Replit-specific guidelines
- [ ] Create provider_guidelines table + seed data
- [ ] Build guidelines lookup logic (by agent + provider)
- [ ] Inject guidelines into system prompt generation

### Epic 7: Basic Storage
- [ ] Create prompts table + RLS policies
- [ ] Build save prompt flow
- [ ] Create basic library view (list)
- [ ] Implement prompt delete
- [ ] Add favorites toggle

### Epic 8: Landing Page
- [ ] Design hero section
- [ ] Build feature highlights
- [ ] Add CTA to signup
- [ ] Implement responsive layout
- [ ] Add basic SEO meta tags

---

## 10. Verification Strategy

### Manual Testing Checklist
- [ ] Generate prompt in Hebrew → verify English output
- [ ] Generate prompt in English → verify quality
- [ ] Switch agent targets → verify dialect differences
- [ ] Try all length options → verify output length
- [ ] Test implement vs diagnose → verify strategy reflects
- [ ] Test clarify-first toggle → verify questions appear
- [ ] Copy prompt → paste in external app
- [ ] Save prompt → verify appears in library
- [ ] Delete prompt → verify removed
- [ ] Switch themes → verify all components adapt
- [ ] Test on mobile viewport → verify responsive

### Integration Tests (E2E with Playwright)
- Auth flow (signup, login, logout)
- Composer full flow (input → generate → copy → save)
- Settings (configure AI provider)
- Library CRUD operations

### Unit Tests (Vitest)
- Hebrew detection function
- Prompt assembly logic
- Agent dialect rules
- Theme toggle logic

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI quality varies by provider | Medium | Test with multiple providers, add provider-specific prompts |
| Hebrew detection inaccurate | Medium | Use Unicode range check + optional user override |
| Offline sync conflicts | High | Start with last-write-wins, add conflict UI in v1 |
| Token costs add up | Medium | Show estimated tokens, enforce budget limits |
| Scope creep (4 modes) | High | Strict phase gates, ship Quick Convert first |
| Solo dev burnout | Medium | Timebox phases, celebrate milestones |

---

## 12. Key Files to Create

```
/apps/web/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── app/
│       ├── layout.tsx          # App shell
│       ├── page.tsx            # Composer (Quick Convert)
│       ├── settings/page.tsx
│       ├── library/page.tsx
│       └── projects/page.tsx
├── components/
│   ├── ui/                     # shadcn components
│   ├── composer/
│   │   ├── input-panel.tsx
│   │   ├── output-panel.tsx
│   │   ├── options-bar.tsx
│   │   └── linter-hints.tsx
│   └── layout/
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── theme-toggle.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── ai/
│   │   ├── provider-interface.ts
│   │   ├── openai-adapter.ts
│   │   ├── claude-adapter.ts
│   │   └── prompt-builder.ts
│   └── utils/
│       ├── hebrew-detector.ts
│       └── clipboard.ts
└── styles/
    └── globals.css             # Tailwind + tokens

/packages/shared/
├── types/
│   ├── prompt.ts
│   ├── project.ts
│   ├── ai-provider.ts
│   └── guidelines.ts
├── constants/
│   ├── agent-dialects.ts
│   ├── prompt-templates.ts
│   └── provider-guidelines/
│       ├── openai.ts          # Curated OpenAI guidelines
│       ├── anthropic.ts       # Curated Claude guidelines
│       ├── google.ts          # Curated Gemini guidelines
│       ├── cursor.ts          # Cursor-specific rules
│       ├── lovable.ts         # Lovable-specific rules
│       └── replit.ts          # Replit-specific rules
└── validators/
    └── prompt-schema.ts
```

---

## Summary

**What we're building:** A prompt transformation tool that converts messy dev issues into professional, agent-ready prompts.

**MVP scope:** Quick Convert mode with Hebrew → English, agent targeting, copy/save functionality.

**Stack:** Next.js 15 + Supabase + Tailwind/shadcn + pluggable AI providers.

**Methodology:** Get Shit Done (GSD) for spec-driven development with fresh contexts per task.

**Timeline:** ~5 weeks for MVP, ~10 weeks for v1 (all 4 modes), ~14 weeks for v2 (mobile).

---

## Getting Started (First Session)

```bash
# 1. Create project directory
mkdir prompt-ops-copilot && cd prompt-ops-copilot

# 2. Initialize GSD
npx get-shit-done-cc

# 3. GSD will guide you through:
#    - Project initialization
#    - Requirements gathering
#    - Roadmap creation
#    - Phase 1 planning
```

**First GSD Phase (Foundation):**
- Monorepo setup (pnpm + Turborepo)
- Next.js 15 + TypeScript
- Supabase project + auth
- Design system tokens
- AI provider abstraction

Copy this plan to the project as `DEVELOPMENT_PLAN.md` for reference during GSD sessions.
