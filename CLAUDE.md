# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Development:**
- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Run database migration and build production assets
- `pnpm test` - Run Playwright e2e tests (requires PLAYWRIGHT=True environment variable)

**Code Quality:**
- `pnpm lint` - Run Next.js ESLint and Biome linter with auto-fix
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format code with Biome

**Database Operations:**
- `pnpm db:migrate` - Run database migrations manually
- `pnpm db:generate` - Generate Drizzle schema files
- `pnpm db:studio` - Open Drizzle Studio for database inspection
- `pnpm db:push` - Push schema changes to database
- `pnpm db:pull` - Pull schema from database

## Architecture Overview

This is a Next.js 15 AI chatbot application built with App Router, using xAI Grok models (configurable to Google Gemini) via the AI SDK v5 beta.

**Core Structure:**
- `/app/(auth)/` - Authentication routes and auth configuration (NextAuth.js)
- `/app/(chat)/` - Main chat interface with streaming responses
- `/artifacts/` - Dynamic code/image/text/sheet generators and editors
- `/components/` - React components including chat UI and artifact viewers
- `/lib/ai/` - AI provider configuration, model definitions, and tools
- `/lib/db/` - Drizzle ORM schema, queries, and Postgres database layer
- `/hooks/` - Custom React hooks for chat functionality

**Key Features:**
- **Artifacts System**: Interactive code, image, text, and spreadsheet generation
- **Message Parts Architecture**: Modern message structure with attachments and parts
- **Streaming Responses**: Real-time AI responses with Server-Sent Events
- **Provider Flexibility**: Supports xAI Grok and Google Gemini models
- **Document Management**: Create, edit, and suggest changes to generated documents

**Database Schema:**
- Uses Postgres with Drizzle ORM
- Core tables: `User`, `Chat`, `Message_v2`, `Document`, `Suggestion`, `Vote_v2`
- Legacy tables (`Message`, `Vote`) are deprecated - use v2 variants
- Message parts system for rich content including attachments

**AI Integration:**
- Default provider: xAI with Grok models (grok-2-vision-1212, grok-3-mini-beta)
- Alternative: Google Gemini (gemini-2.5-pro)
- Reasoning model support with `<think>` tag extractione
- Tool support for weather, document creation/updates, and suggestions

**Testing:**
- Playwright for e2e testing with both `e2e/` and `routes/` test suites
- Test environment uses mock AI models in `lib/ai/models.test.ts`
- Tests run against local dev server on port 3000

**Code Quality:**
- Biome for linting and formatting (configured in `biome.jsonc`)
- TypeScript throughout with strict configuration
- Package manager: pnpm
- Build runs database migrations automatically

**Authentication:**
- NextAuth.js v5 beta for authentication
- Supports email/password registration and login
- User sessions persist chat history and document access

The application follows a streaming-first architecture where AI responses are processed in real-time, artifacts are generated dynamically, and the UI updates progressively as data arrives.