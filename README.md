# Prompt Ops Copilot

Transform amateur development issues into professional, agent-ready prompts optimized for AI coding tools.

## Features

- **Quick Convert Mode**: Paste your issue, get a structured prompt instantly
- **Hebrew Support**: Write in Hebrew, get perfect English prompts
- **Agent-Optimized Output**: Tailored prompts for Cursor, Lovable, Replit, and Codex
- **Best Practices Built-in**: Guidelines from OpenAI, Anthropic, and Google
- **Prompt Linting**: Real-time suggestions to improve your input

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **AI**: Pluggable provider interface (OpenAI, Claude, Groq)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd prompt-ops-copilot
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key  # Optional
```

4. Set up the database:
   - Go to your Supabase project's SQL Editor
   - Run the migration in `supabase/migrations/001_initial_schema.sql`

5. Start the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── apps/
│   └── web/                 # Next.js 15 application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   └── lib/         # Utilities & integrations
│       └── ...
├── packages/
│   ├── shared/              # Shared types, constants, utilities
│   └── db/                  # Supabase client & types
├── supabase/
│   └── migrations/          # Database migrations
└── ...
```

## Key Directories

- `apps/web/src/components/composer/` - Main composer UI components
- `apps/web/src/lib/ai/` - AI provider abstraction and prompt building
- `packages/shared/src/constants/provider-guidelines/` - Curated AI guidelines
- `packages/shared/src/types/` - TypeScript type definitions

## Configuration

### AI Providers

Users can configure their own AI provider in Settings. Supported providers:
- OpenAI (GPT-4o, GPT-4, etc.)
- Anthropic (Claude)
- Groq (Llama)
- Ollama (Local models)

### Theming

The app supports light and dark themes. Toggle in the header or use system preference.

## Development

```bash
# Run development server
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Build for production
pnpm build
```

## Roadmap

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full roadmap.

### Phase 1 (MVP) - Current
- [x] Quick Convert mode
- [x] Agent targeting
- [x] Hebrew detection
- [x] Prompt linting
- [x] Copy to clipboard

### Phase 2 (v1)
- [ ] Smart Form mode
- [ ] Projects with context packs
- [ ] Prompt library
- [ ] Offline support

### Phase 3+
- [ ] Guided Wizard
- [ ] Pro Split View
- [ ] Mobile app

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines first.
