---
phase: quick
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/library/library-filters.tsx
  - apps/web/src/components/library/prompt-card.tsx
  - apps/web/src/app/app/library/page.tsx
  - apps/web/src/app/api/prompts/route.ts
autonomous: true

must_haves:
  truths:
    - "User can apply tags to prompts from library"
    - "Tags display with colors on prompt cards"
    - "User can filter library by tags"
  artifacts:
    - path: "apps/web/src/components/library/prompt-card.tsx"
      provides: "Colored tag badges display, tag management menu item"
    - path: "apps/web/src/components/library/library-filters.tsx"
      provides: "Multi-select tag filter dropdown"
    - path: "apps/web/src/app/api/prompts/route.ts"
      provides: "Tag filtering via tags query param"
  key_links:
    - from: "library/page.tsx"
      to: "/api/tags"
      via: "fetch tags for colors and filter options"
    - from: "prompt-card.tsx"
      to: "/api/prompts/[id]"
      via: "PATCH with tags array"
---

<objective>
Add tag-prompt integration to the library: apply tags to prompts, display colored tags on cards, filter by tags.

Purpose: Connect the tag management system (quick-001) to the prompt library for organization.
Output: Working tag selection, colored display, and filtering in library.
</objective>

<execution_context>
@C:\Users\moyak\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\moyak\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@apps/web/src/components/library/library-filters.tsx
@apps/web/src/components/library/prompt-card.tsx
@apps/web/src/app/app/library/page.tsx
@apps/web/src/app/api/prompts/route.ts
@apps/web/src/app/api/prompts/[id]/route.ts
@apps/web/src/app/api/tags/route.ts
@packages/shared/src/types/tag.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add tag filtering to API and filters bar</name>
  <files>
    apps/web/src/app/api/prompts/route.ts
    apps/web/src/components/library/library-filters.tsx
    apps/web/src/app/app/library/page.tsx
  </files>
  <action>
    1. **API (route.ts GET):** Add `tags` query param support. Accept comma-separated tag names. Use Supabase `overlaps` operator to filter prompts where tags array overlaps with requested tags:
       ```typescript
       const tags = searchParams.get('tags') || '';
       if (tags) {
         const tagArray = tags.split(',').filter(Boolean);
         query = query.overlaps('tags', tagArray);
       }
       ```

    2. **LibraryFilters type:** Add `tags: string[]` to `LibraryFilters` interface. Update `clearFilters` to include `tags: []`.

    3. **LibraryFiltersBar component:**
       - Accept new prop `availableTags: Tag[]` (import Tag from @prompt-ops/shared)
       - Add multi-select dropdown for tags using existing Select pattern but with checkboxes
       - Use Popover + Command pattern (like shadcn multi-select) or simple toggle badges for each tag
       - Display each tag with its color as a small dot/indicator
       - Show selected tag count in trigger: "Tags (2)" or "All Tags"

    4. **Library page.tsx:**
       - Add state: `const [tags, setTags] = React.useState<Tag[]>([])`
       - Add fetch for tags: call `/api/tags` on mount, store in state
       - Pass `availableTags={tags}` to LibraryFiltersBar
       - Update `fetchPrompts` to include tags param: `if (filters.tags.length) params.set('tags', filters.tags.join(','))`
       - Update `hasActiveFilters` check in filters bar to include `filters.tags.length > 0`

    Pattern notes:
    - Follow existing Select/filter patterns in library-filters.tsx
    - Use Badge component for tag display with inline style for background color
  </action>
  <verify>
    1. `pnpm type-check` passes
    2. Filter by tag works - selecting a tag filters library to only prompts with that tag
    3. Multiple tags filter with OR logic (prompt has any of selected tags)
  </verify>
  <done>Tag filter appears in library filters bar, selecting tags filters the prompt list correctly</done>
</task>

<task type="auto">
  <name>Task 2: Display colored tags on PromptCard and add tag management</name>
  <files>
    apps/web/src/components/library/prompt-card.tsx
    apps/web/src/app/app/library/page.tsx
  </files>
  <action>
    1. **PromptCard props:** Add `availableTags: Tag[]` prop to receive tag metadata for colors.

    2. **Display colored tags in CardFooter:**
       - Keep existing tag display logic (showing up to 3 tags + overflow count)
       - Lookup each tag name in availableTags to get color
       - Apply color to badge: use inline style `backgroundColor` with opacity, or colored left border
       - Example: `<Badge style={{ backgroundColor: `${tagColor}20`, borderLeft: `3px solid ${tagColor}` }}>`
       - Fallback to default gray if tag not found in availableTags (tag was deleted but still on prompt)

    3. **Add "Manage Tags" to dropdown menu:**
       - Add new DropdownMenuItem "Manage Tags" with Tag icon
       - On click, call new prop `onManageTags?: () => void`

    4. **Create TagSelectorDialog component** (new file or inline in library page):
       - Simple dialog with list of all available tags as checkboxes
       - Current prompt's tags pre-selected
       - On save, call `PATCH /api/prompts/[id]` with updated tags array
       - Pattern: Follow existing dialog patterns in codebase

    5. **Wire up in library page.tsx:**
       - Add state for tag management: `const [managingTagsForPrompt, setManagingTagsForPrompt] = React.useState<Prompt | null>(null)`
       - Pass `availableTags={tags}` to each PromptCard
       - Pass `onManageTags={() => setManagingTagsForPrompt(prompt)}` to each PromptCard
       - Add TagSelectorDialog that opens when managingTagsForPrompt is set
       - On dialog save, update local prompts state with new tags

    Pattern notes:
    - Use AlertDialog or Dialog from shadcn for tag selector
    - Use Checkbox component for tag selection
    - Follow handleToggleFavorite pattern for the PATCH call
  </action>
  <verify>
    1. `pnpm type-check` passes
    2. Tags on prompt cards show with their assigned colors
    3. "Manage Tags" menu item opens dialog
    4. Selecting/deselecting tags and saving updates the prompt
    5. Changes persist after page refresh
  </verify>
  <done>Prompt cards display colored tags, users can manage tags via dropdown menu and dialog</done>
</task>

</tasks>

<verification>
1. `pnpm type-check` - no TypeScript errors
2. `pnpm lint` - no linting errors
3. Manual test flow:
   - Open library page, see tags filter option
   - Create prompt if none exist
   - Use "Manage Tags" to add tags to prompt
   - See colored tags on prompt card
   - Filter library by tag - only tagged prompts show
   - Click tag on card - filters to that tag
</verification>

<success_criteria>
- Tag filter dropdown appears in library filters bar with user's tags
- Selecting tags filters prompts (OR logic - has any selected tag)
- Prompt cards show tags with their assigned colors
- "Manage Tags" in dropdown opens tag selector dialog
- Can add/remove tags from prompts via dialog
- Changes persist to database
</success_criteria>

<output>
After completion, create `.planning/quick/002-tag-prompt-integration/002-SUMMARY.md`
</output>
