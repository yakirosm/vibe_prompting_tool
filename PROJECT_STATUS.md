# Prompt Ops Copilot - Project Status

**Last Updated:** January 31, 2026
**Status:** Extended MVP - i18n Complete, Tag Features Complete

---

## Quick Context

**What is this?** A tool that transforms amateur development issues into professional, agent-ready prompts optimized for AI coding tools (Cursor, Lovable, Replit, etc.). Supports Hebrew input with automatic English translation.

**Tech Stack:** Next.js 15, TypeScript, Tailwind, shadcn/ui, Supabase, pnpm monorepo

**Start Dev Server:** `pnpm dev` → http://localhost:3003

---

## Active Tasks

### In Progress
- None currently

### Up Next (Priority Order)
1. **Custom Tweaks UI** (`/app/tweaks`) - Allow users to create reusable prompt modifications
2. **Project Context Integration** - Inject project context into generated prompts
3. **Project Selector in Composer** - Select active project when generating
4. **Discovery Prompt Flow** - Copy discovery prompt → paste AI response → auto-extract context

### Backlog
- [ ] Smart Form mode (guided input fields)
- [ ] Wizard mode (step-by-step prompt building)
- [ ] Pro mode (advanced options)
- [ ] Google OAuth configuration
- [ ] Prompt sharing/export
- [ ] Analytics dashboard
- [ ] Mobile app (Expo)

---

## Recent Changes

### Jan 31, 2026 (Latest)
- **RTL Toggle Fix** - Replaced Switch+Badge with ToggleGroup for "Questions Mode" (RTL-safe)
- **i18n Complete** - Full Hebrew/English support with next-intl, RTL layouts
- **Tag Features Complete** - Usage counts, sorting, search in dropdowns, bulk operations

### Jan 30, 2026
- Custom Agents feature (`/app/agents`)
- Tag Management feature (`/app/tags`)
- Prompt Library bulk operations

---

## Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Core Composer | ✅ Done | Input → AI → Output flow |
| i18n (EN/HE) | ✅ Done | RTL support, locale routing |
| Prompt Library | ✅ Done | Search, filter, bulk tags |
| Projects | ✅ Done | CRUD, context packs |
| Custom Agents | ✅ Done | 11 built-in + custom |
| Tags | ✅ Done | Full CRUD, sorting, bulk ops |
| Custom Tweaks | 🔲 Todo | UI not built yet |
| Settings | ⚠️ Partial | Basic UI, needs polish |

---

## Key Files

### Composer (Main Feature)
- `apps/web/src/components/composer/composer.tsx` - Main orchestrator
- `apps/web/src/components/composer/options-bar.tsx` - Agent/length/strategy selectors
- `apps/web/src/components/composer/input-panel.tsx` - User input with RTL detection
- `apps/web/src/components/composer/output-panel.tsx` - Generated prompt display

### AI Logic
- `apps/web/src/lib/ai/prompt-builder.ts` - Builds AI messages with guidelines
- `apps/web/src/lib/ai/provider-interface.ts` - OpenAI/Anthropic/Groq abstraction
- `packages/shared/src/constants/agent-dialects.ts` - Agent-specific prompt rules

### i18n
- `apps/web/messages/en.json` - English translations
- `apps/web/messages/he.json` - Hebrew translations
- `apps/web/src/i18n/routing.ts` - Locale configuration
- `apps/web/src/middleware.ts` - Locale detection/routing

### Database
- `supabase/migrations/001_initial_schema.sql` - Core tables
- `supabase/migrations/002_extended_features.sql` - Tags, custom agents
- `supabase/migrations/003_custom_agents_extension.sql` - Agent UI fields

---

## App Routes

| Route | Purpose |
|-------|---------|
| `/[locale]` | Landing page |
| `/[locale]/app` | Main Composer |
| `/[locale]/app/library` | Saved prompts |
| `/[locale]/app/projects` | Project management |
| `/[locale]/app/agents` | Custom agents |
| `/[locale]/app/tags` | Tag management |
| `/[locale]/app/tweaks` | Custom tweaks (TODO) |
| `/[locale]/app/settings` | User settings |
| `/[locale]/login` | Login page |
| `/[locale]/signup` | Signup page |

---

## Commands

```bash
pnpm dev          # Start dev server (port 3003)
pnpm build        # Production build
pnpm type-check   # TypeScript validation
pnpm lint         # ESLint
pnpm clean        # Remove node_modules and build artifacts
```

---

## Environment Setup

Copy `apps/web/.env.example` to `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-key
# OR ANTHROPIC_API_KEY=sk-ant-your-key
```

---

## Notes for Claude

- **Monorepo:** Use `pnpm --filter @prompt-ops/web <command>` for web-specific tasks
- **Translations:** Always update both `en.json` and `he.json` when adding UI text
- **RTL:** Test Hebrew layouts at `/he/app` - panels should swap, text should be RTL
- **Components:** Use shadcn/ui components from `@/components/ui/*`
- **Types:** Shared types are in `packages/shared/src/types/`
- **API Routes:** All in `apps/web/src/app/api/`

---

*Last session completed RTL fix for Questions Mode toggle. Ready for next task.*
