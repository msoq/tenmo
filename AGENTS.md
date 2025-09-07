## Project overview

Tenmo is an AI-powered language learning web app combining conversational practice with structured, topic-driven phrase training and actionable feedback.

## Setup commands

- Install deps: `pnpm install`
- Prepare environment (`.env.local`):
  - `PROVIDER_NAME` = `openai|google|xai|anthropic|openrouter|test`
  - `POSTGRES_URL` (connection string)
  - `AUTH_SECRET` (NextAuth secret)
- Initialize database: `pnpm db:migrate`
- Start dev server: `pnpm dev` (open http://localhost:3000)
- Build: `pnpm build` (runs DB migrate first)
- Start production: `pnpm start`

## Testing instructions

- Run tests: `pnpm test` (Playwright)
- Playwright bootstraps the dev server and probes `/ping` before tests.
- Focus or debug as needed using Playwright CLI flags.

## Code style and conventions

- TypeScript strict; explicit types on exported APIs
- Prefer early returns and maintain shallow control flow
- UI: Tailwind CSS + Radix; prefer Tailwind's built-in animation utilities (no custom CSS files for animations)
- Client data fetching: use SWR for client↔server patterns; avoid ad‑hoc fetch logic
- Errors (server/API): throw `ChatSDKError` and convert with `toResponse()`
- Database access must go through `lib/db/queries.ts` (no ad‑hoc SQL)
- Use `server-only` and `'use server'` where relevant
- Lint/format: `pnpm lint`, `pnpm lint:fix`, `pnpm format`

## Architecture and key paths

- Framework: Next.js 15 (App Router) with Partial Prerendering enabled
- React 19 RC, Vercel AI SDK v5
- Directories
  - `app/(auth)`: Auth pages, NextAuth v5 config, server actions
  - `app/(chat)`: Chat UI and APIs
  - `app/(phrases)`: Phrase practice UI and APIs
  - `lib/ai`: Providers, models, prompts, entitlements
  - `lib/db`: Drizzle schema, queries, migrations, migrate script
  - `components/`: UI and feature components (`components/ui/*` for primitives)
  - `tests/`: Playwright tests (e2e and routes)

## Project structure

- `app/`: Next.js App Router entrypoints and route groups
  - `(auth)/`: Auth pages, NextAuth config, server actions
  - `(chat)/`: Chat UI, APIs, layout
  - `(phrases)/`: Phrase practice UI and APIs
  - `api/speech/`: Speech-related API route
- `components/`: Shared UI and feature components
  - `ui/`: Design system primitives (Radix/shadcn + Tailwind)
- `lib/`: Server logic, AI, DB, and utilities
  - `ai/`: Provider registry, models, prompts, entitlements
  - `db/`: Drizzle schema, queries, migrations, migrate script
  - `editor/`: Artifact diff/renderer utilities
- `hooks/`: Client-side React hooks used across features
- `artifacts/`: Artifact streaming/rendering (server and client components)
- `tests/`: Playwright e2e and route tests
- `public/`: Static assets (images, icons)
- `memory-bank/`: Persistent project context for agents

## Auth behavior

- NextAuth v5 with two Credentials providers: `credentials` (email/password) and `guest`
- Middleware auto‑provisions guests and blocks `/login`/`/register` for authenticated non‑guest users
- JWT/session includes `user.id` and `user.type` (`guest | regular`)

## AI configuration

- Provider selected by env `PROVIDER_NAME`
- Reasoning models are wrapped by `extractReasoningMiddleware`
- System prompts compose geo hints and artifacts guidance for non‑reasoning models

## Database and migrations

- Drizzle ORM with migrations in `lib/db/migrations`
- Canonical schema: `lib/db/schema.ts`
- Migrate: `pnpm db:migrate`
- Other DB scripts available via `pnpm db:*`

## Observability and errors

- OpenTelemetry registration via `instrumentation.ts` (`serviceName: ai-chatbot`)
- Convert server errors to HTTP responses using `ChatSDKError#toResponse()`

## PR and commit guidelines

- Before committing or opening a PR:
  - Run `pnpm lint` and fix issues
  - Run `pnpm test` and ensure all tests pass
- Keep changes aligned with conventions above (SWR usage, centralized DB, Tailwind animations)

## Agent notes

- Agents reading this file should follow the conventions and run the commands listed here to validate changes.
