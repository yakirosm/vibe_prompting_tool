---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/shared/src/types/tag.ts
  - packages/shared/src/index.ts
  - apps/web/src/app/api/tags/route.ts
  - apps/web/src/app/api/tags/[id]/route.ts
  - apps/web/src/components/tags/tag-card.tsx
  - apps/web/src/components/tags/tag-form-dialog.tsx
  - apps/web/src/app/app/tags/page.tsx
  - apps/web/src/components/layout/header.tsx
autonomous: true

must_haves:
  truths:
    - "User can view all their tags on /app/tags"
    - "User can create a new tag with name and color"
    - "User can edit an existing tag"
    - "User can delete a tag"
    - "User can navigate to tags from header"
  artifacts:
    - path: "apps/web/src/app/app/tags/page.tsx"
      provides: "Tags management page"
    - path: "apps/web/src/app/api/tags/route.ts"
      provides: "GET/POST endpoints for tags"
      exports: ["GET", "POST"]
    - path: "apps/web/src/app/api/tags/[id]/route.ts"
      provides: "GET/PATCH/DELETE endpoints for single tag"
      exports: ["GET", "PATCH", "DELETE"]
  key_links:
    - from: "apps/web/src/app/app/tags/page.tsx"
      to: "/api/tags"
      via: "fetch in useCallback"
    - from: "apps/web/src/components/layout/header.tsx"
      to: "/app/tags"
      via: "Link component"
---

<objective>
Create a full Tag Management UI with CRUD operations, color picker, and navigation integration.

Purpose: Enable users to create and manage reusable tags for organizing prompts, following the established agents page pattern.
Output: Working /app/tags page with API routes and header navigation link.
</objective>

<execution_context>
@C:\Users\moyak\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\moyak\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/app/app/agents/page.tsx (pattern reference)
@apps/web/src/components/agents/agent-card.tsx (pattern reference)
@apps/web/src/components/agents/agent-form-dialog.tsx (pattern reference)
@apps/web/src/app/api/agents/route.ts (pattern reference)
@apps/web/src/app/api/agents/[id]/route.ts (pattern reference)
@supabase/migrations/20260130170613_extended_features_v2.sql (tags table schema)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Tag Type and API Routes</name>
  <files>
    packages/shared/src/types/tag.ts
    packages/shared/src/index.ts
    apps/web/src/app/api/tags/route.ts
    apps/web/src/app/api/tags/[id]/route.ts
  </files>
  <action>
1. Create `packages/shared/src/types/tag.ts`:
   ```typescript
   export interface Tag {
     id: string;
     user_id: string;
     name: string;
     color: string;
     created_at: string;
   }
   ```

2. Add export to `packages/shared/src/index.ts`:
   ```typescript
   export * from './types/tag';
   ```

3. Create `apps/web/src/app/api/tags/route.ts` following agents/route.ts pattern:
   - GET: Fetch all user tags, support `?search=` query param, order by created_at desc
   - POST: Create tag with { name, color }, validate name required, default color '#6366f1'
   - Use same auth pattern as agents (createClient, getUser, check isSupabaseConfigured)
   - Table: 'tags', RLS already configured

4. Create `apps/web/src/app/api/tags/[id]/route.ts` following agents/[id]/route.ts pattern:
   - GET: Fetch single tag by id, verify user_id match
   - PATCH: Update tag (name and/or color fields)
   - DELETE: Delete tag by id
   - Use `{ params }: { params: Promise<{ id: string }> }` for Next.js 15 pattern
  </action>
  <verify>
    - `pnpm --filter @prompt-ops/shared type-check` passes
    - `pnpm --filter @prompt-ops/web type-check` passes
  </verify>
  <done>Tag type exported from shared package, all 4 API endpoints created following established patterns</done>
</task>

<task type="auto">
  <name>Task 2: Create Tag Components and Page</name>
  <files>
    apps/web/src/components/tags/tag-card.tsx
    apps/web/src/components/tags/tag-form-dialog.tsx
    apps/web/src/app/app/tags/page.tsx
  </files>
  <action>
1. Create `apps/web/src/components/tags/tag-card.tsx`:
   - Follow AgentCard pattern but simpler (tags only have name, color)
   - Show colored circle/badge with tag color
   - DropdownMenu with Edit/Delete options
   - Display created_at date formatted like AgentCard

2. Create `apps/web/src/components/tags/tag-form-dialog.tsx`:
   - Follow AgentFormDialog pattern
   - Fields: name (required), color (with preset color options)
   - Color picker: Use 8-10 preset colors as clickable circles/buttons
   - Preset colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#6b7280']
   - Show selected color preview next to name input
   - Submit creates or updates based on whether tag prop exists

3. Create `apps/web/src/app/app/tags/page.tsx`:
   - Follow AgentsPage pattern exactly
   - Header: "Tags" title, count, "New Tag" button
   - Search input + grid/list toggle
   - Empty state with Tag icon, "No tags yet" message
   - Grid/list rendering of TagCard components
   - Delete confirmation AlertDialog
   - TagFormDialog for create/edit
   - Use Tag icon from lucide-react
  </action>
  <verify>
    - `pnpm --filter @prompt-ops/web type-check` passes
    - `pnpm dev` starts without errors
  </verify>
  <done>TagCard, TagFormDialog components created, /app/tags page renders with full CRUD UI</done>
</task>

<task type="auto">
  <name>Task 3: Add Tags Navigation to Header</name>
  <files>
    apps/web/src/components/layout/header.tsx
  </files>
  <action>
1. Import Tag icon from lucide-react (use `Tag` icon)

2. Add Tags navigation button in the isAppRoute section, after Custom Agents button and before Custom Tweaks button:
   ```tsx
   <Tooltip>
     <TooltipTrigger asChild>
       <Button variant="ghost" size="icon" asChild>
         <Link href="/app/tags" aria-label="Tags">
           <Tag className="h-4 w-4" />
         </Link>
       </Button>
     </TooltipTrigger>
     <TooltipContent>
       <p>Tags</p>
     </TooltipContent>
   </Tooltip>
   ```

3. Position in nav order: Library, Projects, Agents, Tags, Tweaks (Tags before Tweaks)
  </action>
  <verify>
    - `pnpm --filter @prompt-ops/web type-check` passes
    - Header shows Tags icon button when on /app/* routes
  </verify>
  <done>Tags navigation link appears in header with tooltip</done>
</task>

</tasks>

<verification>
1. Type checking: `pnpm type-check` passes for entire monorepo
2. Dev server: `pnpm dev` starts without errors
3. Navigation: Tags icon visible in header on /app routes
4. Page loads: /app/tags page renders without errors
5. CRUD works (requires auth):
   - Create new tag with name and color
   - Edit existing tag
   - Delete tag with confirmation
   - Search filters tags
   - Grid/list toggle works
</verification>

<success_criteria>
- Tag type exported from @prompt-ops/shared
- All 4 API routes (GET/POST /api/tags, GET/PATCH/DELETE /api/tags/[id]) functional
- /app/tags page with full CRUD matching agents page UX
- Color picker with preset colors in tag form
- Tags link in header navigation
- Type checking passes across monorepo
</success_criteria>

<output>
After completion, create `.planning/quick/001-tag-management-ui/001-SUMMARY.md`
</output>
