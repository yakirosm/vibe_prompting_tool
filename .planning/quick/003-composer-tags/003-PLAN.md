---
phase: quick-003
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/composer/composer.tsx
  - apps/web/src/components/composer/output-panel.tsx
  - apps/web/src/app/api/prompts/route.ts
autonomous: true

must_haves:
  truths:
    - "User can select existing tags when saving a prompt"
    - "User can create a new tag inline without leaving the composer"
    - "Selected tags are saved with the prompt"
    - "Tags are optional - users can save without tagging"
  artifacts:
    - path: "apps/web/src/components/composer/output-panel.tsx"
      provides: "Tag selector UI in output panel footer"
      contains: "TagSelector"
    - path: "apps/web/src/components/composer/composer.tsx"
      provides: "Tags state and save flow integration"
      contains: "selectedTags"
    - path: "apps/web/src/app/api/prompts/route.ts"
      provides: "Tags field in save request"
      contains: "tags:"
  key_links:
    - from: "output-panel.tsx"
      to: "composer.tsx"
      via: "onTagsChange prop callback"
      pattern: "onTagsChange"
    - from: "composer.tsx"
      to: "/api/prompts"
      via: "tags in save payload"
      pattern: "tags.*selectedTags"
---

<objective>
Add tag selection to the Composer output panel so users can optionally tag prompts before saving.

Purpose: Allow users to organize prompts with tags at creation time (rather than only after saving in the library).
Output: Tag selector in output panel footer, inline tag creation, tags saved with prompt.
</objective>

<execution_context>
@C:\Users\moyak\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\moyak\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/composer/composer.tsx
@apps/web/src/components/composer/output-panel.tsx
@apps/web/src/components/library/tag-selector-dialog.tsx
@apps/web/src/components/tags/tag-form-dialog.tsx
@apps/web/src/app/api/prompts/route.ts
@packages/shared/src/types/tag.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add tag selector to OutputPanel</name>
  <files>
    apps/web/src/components/composer/output-panel.tsx
  </files>
  <action>
Add tag selection UI to the OutputPanel footer area (near the Save button). The implementation should:

1. Add new props to OutputPanelProps:
   - `availableTags: Tag[]` - list of user's tags (fetched by parent)
   - `selectedTags: string[]` - currently selected tag names
   - `onTagsChange: (tags: string[]) => void` - callback when tags change
   - `onCreateTag: (name: string, color: string) => Promise<void>` - callback to create new tag

2. Add a tag selector component in the CardFooter (before the Save button, only show when isAuthenticated and output exists):
   - Use DropdownMenu (already used in codebase) with DropdownMenuCheckboxItem for tag multi-select
   - Display selected tags as small colored badges
   - Add "Create new tag" option at bottom of dropdown that opens inline creation
   - For inline creation: show small form with name input and color picker (use PRESET_COLORS from tag-form-dialog pattern)

3. Style the tags section to be compact and not overwhelm the footer:
   - Tags displayed inline as small badges with background tint
   - Dropdown trigger: small "Tags" button or icon (Tag icon from lucide-react)
   - Keep footer layout clean: [Tags section] [spacer] [Regenerate] [Save] [Copy]

Import Tag type from @prompt-ops/shared. Import DropdownMenu components from @/components/ui/dropdown-menu. Import Tag icon from lucide-react.
  </action>
  <verify>
TypeScript compiles without errors: `pnpm type-check`
  </verify>
  <done>
OutputPanel has tag selector UI with multi-select dropdown, selected tag badges display, and inline tag creation form.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire up tags state in Composer and save flow</name>
  <files>
    apps/web/src/components/composer/composer.tsx
    apps/web/src/app/api/prompts/route.ts
  </files>
  <action>
1. In composer.tsx:
   - Add state: `const [selectedTags, setSelectedTags] = React.useState<string[]>([]);`
   - Add state: `const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);`
   - Fetch tags on mount (when authenticated):
     ```typescript
     React.useEffect(() => {
       if (!isAuthenticated) return;
       fetch('/api/tags')
         .then(res => res.ok ? res.json() : { tags: [] })
         .then(data => setAvailableTags(data.tags || []))
         .catch(() => {});
     }, [isAuthenticated]);
     ```
   - Add handleCreateTag function:
     ```typescript
     const handleCreateTag = React.useCallback(async (name: string, color: string) => {
       const response = await fetch('/api/tags', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, color }),
       });
       if (!response.ok) throw new Error('Failed to create tag');
       const data = await response.json();
       setAvailableTags(prev => [...prev, data.tag]);
       setSelectedTags(prev => [...prev, data.tag.name]);
     }, []);
     ```
   - Reset selectedTags when output changes (new generation): add to handleGenerate after setOutput
   - Update SavePromptData interface to include `tags?: string[]`
   - Update handleSave to pass tags: `tags: selectedTags.length > 0 ? selectedTags : undefined`
   - Pass new props to OutputPanel: availableTags, selectedTags, onTagsChange={setSelectedTags}, onCreateTag={handleCreateTag}

2. In api/prompts/route.ts POST handler:
   - Add `tags?: string[]` to SavePromptRequest interface
   - Extract tags from body: `const { input, agent, length, strategy, generatedPrompt, tags } = body;`
   - Add to insertData: `tags: tags || null,`
   - The prompts table already has a tags column (string[] type) from previous migrations

Import Tag type from @prompt-ops/shared in composer.tsx.
  </action>
  <verify>
1. TypeScript compiles: `pnpm type-check`
2. Run dev server: `pnpm dev`
3. Generate a prompt, select tags, save - verify tags appear in library view
  </verify>
  <done>
Tags flow works end-to-end: user can select/create tags in composer, tags are saved with prompt, appear in library.
  </done>
</task>

</tasks>

<verification>
1. `pnpm type-check` passes
2. Dev server runs without errors
3. Manual test flow:
   - Generate a prompt in composer
   - Tag selector appears in output panel footer (only when authenticated)
   - Can select existing tags (checkboxes in dropdown)
   - Selected tags show as colored badges
   - Can create new tag inline (name + color picker)
   - Saving prompt includes tags
   - Tags appear on prompt in library
</verification>

<success_criteria>
- Tag selector visible in output panel when authenticated and prompt generated
- Multi-select dropdown shows available tags with checkboxes
- Selected tags displayed as colored badges
- Inline tag creation works (name + color)
- Saving prompt includes selected tags
- Tags are optional (can save without selecting any)
</success_criteria>

<output>
After completion, create `.planning/quick/003-composer-tags/003-SUMMARY.md`
</output>
