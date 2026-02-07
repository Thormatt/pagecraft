# PageCraft

Generate beautiful HTML pages with AI and deploy them instantly.

Built with Next.js 16, Supabase, and OpenRouter (Anthropic Claude).

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key

## Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI generation |

3. Run Supabase migrations (requires [Supabase CLI](https://supabase.com/docs/guides/cli)):

```bash
supabase db push
```

Migrations live in `supabase/migrations/` and are applied in filename order.

4. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
  app/              # Next.js App Router pages & API routes
    (dashboard)/    # Authenticated dashboard pages
    api/            # API routes (generate, pages, profile, etc.)
    p/[...path]/    # Public page serving (sandboxed)
  components/       # React components
  lib/              # Shared utilities (Supabase clients, AI, constants)
  types/            # TypeScript type definitions
  data/             # Static data (starter templates)
supabase/
  migrations/       # SQL migrations (applied with supabase db push)
```

## Deployment

Deploy to [Vercel](https://vercel.com):

1. Connect your GitHub repo to Vercel
2. Set the environment variables listed above
3. Deploy — Vercel auto-detects Next.js

For Supabase, run `supabase db push` against your production project or use the Supabase dashboard to apply migrations.
