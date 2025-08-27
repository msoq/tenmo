## Tech Context – Tenmo

### Core Stack
- Next.js 15 (App Router, PPR enabled)
- React 19 RC, TypeScript (strict)
- Tailwind CSS + Radix UI + `tailwindcss-animate`
- Drizzle ORM + drizzle-kit migrations (PostgreSQL)
- NextAuth v5 (credentials + guest)
- Vercel AI SDK v5 (OpenAI, Google, xAI, Anthropic, OpenRouter)
- Playwright for e2e; OTel via `@vercel/otel`

### Key Packages
- `ai`, `@ai-sdk/*`, `@openrouter/ai-sdk-provider`
- `drizzle-orm`, `drizzle-kit`, `postgres`
- `next-auth`, `bcrypt-ts`
- `tailwindcss`, `@tailwindcss/typography`, `tailwindcss-animate`
- `@radix-ui/react-*`, `clsx`, `class-variance-authority`
- `@vercel/*`

### Config Highlights
- `next.config.ts`: `experimental.ppr=true`, remote image host `avatar.vercel.sh`
- `tailwind.config.ts`: class-based dark mode; extended theme tokens; animation plugin
- `tsconfig.json`: strict, `@/*` path alias, bundler moduleResolution
- `biome.jsonc`: formatting and linting rules; ESLint also runs via Next
- `playwright.config.ts`: starts server with `pnpm dev`, probes `${baseURL}/ping`
- `drizzle.config.ts`: schema path `lib/db/schema.ts`, migrations under `lib/db/migrations`

### Environment Variables
- `PROVIDER_NAME` = `openai|google|xai|anthropic|openrouter|test`
- `POSTGRES_URL` connection string
- `AUTH_SECRET` for NextAuth
- Test toggles: `PLAYWRIGHT`, `PLAYWRIGHT_TEST_BASE_URL`, `CI_PLAYWRIGHT`

### Scripts
- `dev`, `build` (runs `lib/db/migrate` first), `start`
- `lint`, `lint:fix`, `format`
- `db:*` (generate, migrate, studio, push, pull, check, up)
- `test` runs Playwright

### Conventions
- Prefer Tailwind utilities (including animations) over custom CSS files
- Use `ChatSDKError` in server paths and return `toResponse()` from APIs
- Centralize DB access via `lib/db/queries.ts`
- Artifacts for long-form content; avoid immediate updates post-create
- In client components, use SWR for client↔server data fetching; avoid ad-hoc fetch logic

### Directory Structure (high level)
- `app/`
  - `(auth)/`: Auth pages, server actions, NextAuth config
  - `(chat)/`: Chat pages, APIs, layout
  - `(phrases)/`: Phrase learning UI and APIs
  - `api/speech/`: Speech-related API
  - `layout.tsx`, `globals.css`, `middleware.ts`
- `components/`: UI and feature components (chat, artifacts, phrases, `ui/*`)
- `lib/`
  - `ai/`: providers, models, prompts, entitlements
  - `db/`: schema, queries, migrations, migrate script, utils
  - `editor/`: diff/renderer utilities for artifacts
  - `errors.ts`, `constants.ts`, `types/`
- `tests/`: Playwright tests (e2e, routes) + fixtures/helpers/pages
- `public/`: static assets
- `tailwind.config.ts`, `postcss.config.mjs`, `drizzle.config.ts`, `playwright.config.ts`

### How to Run/Develop
1) `pnpm install`
2) `.env.local`: set `POSTGRES_URL`, `AUTH_SECRET`, `PROVIDER_NAME`
3) `pnpm db:migrate`
4) `pnpm dev` → open http://localhost:3000
5) Tests: `pnpm test`


