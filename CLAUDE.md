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
- `/app/(phrase)/` - Language learning phrase generation feature
- `/artifacts/` - Dynamic code/image/text/sheet generators and editors
- `/components/` - React components including chat UI, phrase UI, and artifact viewers
- `/lib/ai/` - AI provider configuration, model definitions, tools, and prompts
- `/lib/db/` - Drizzle ORM schema, queries, and Postgres database layer
- `/hooks/` - Custom React hooks for chat functionality

**Key Features:**
- **Artifacts System**: Interactive code, image, text, and spreadsheet generation
- **Language Learning Phrases**: CEFR-aligned phrase generation for language practice
- **Message Parts Architecture**: Modern message structure with attachments and parts
- **Streaming Responses**: Real-time AI responses with Server-Sent Events
- **Provider Flexibility**: Supports xAI Grok, Google Gemini, and Anthropic Claude models
- **Document Management**: Create, edit, and suggest changes to generated documents
- **Structured Data Generation**: Uses AI SDK v5 `generateObject` for type-safe outputs

**Database Schema:**
- Uses Postgres with Drizzle ORM
- Core tables: `User`, `Chat`, `Message_v2`, `Document`, `Suggestion`, `Vote_v2`
- Legacy tables (`Message`, `Vote`) are deprecated - use v2 variants
- Message parts system for rich content including attachments

**AI Integration:**
- Default provider: Google Gemini (gemini-2.5-pro) 
- Alternative providers: xAI Grok models (grok-2-vision-1212, grok-3-mini-beta), Anthropic Claude
- Reasoning model support with `<think>` tag extraction
- Tool support for weather, document creation/updates, and suggestions
- Structured data generation using `generateObject` with Zod schemas
- Language learning prompts with CEFR level alignment and pedagogical guidelines

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

## Language Learning Feature

**Phrase Generation System:**
- **Route**: `/phrase` with URL parameters for configuration
- **CEFR Levels**: Supports A1, A2, B1, B2, C1, C2 proficiency levels
- **Customizable Parameters**: Source/target languages, topic, phrase count, length, and instructions
- **Server-Side Generation**: Uses `generateObject` for reliable structured output
- **Pedagogical Design**: Expert teacher persona with educational guidelines

**URL Parameter Structure:**
- `from` (required): Source language (e.g., "Spanish")
- `to` (required): Target language (e.g., "English") 
- `topic` (required): Practice topic (e.g., "travel", "food")
- `count` (optional): Number of phrases (1-50, default: 10)
- `level` (optional): CEFR level (A1-C2, default: B1)
- `phraseLength` (optional): Target words per phrase (1-20, default: 5)
- `instruction` (optional): Additional requirements

**Example URLs:**
- `/phrase?from=Spanish&to=English&topic=travel&level=A2&phraseLength=4`
- `/phrase?from=French&to=German&topic=business&level=C1&count=15`

**Implementation:**
- **Prompt Engineering**: Located in `lib/ai/prompts/phrase.ts` with CEFR-specific guidance
- **Validation**: Zod schemas for both URL parameters and AI output
- **Error Handling**: Custom error pages with user-friendly parameter guidance
- **Type Safety**: Full TypeScript integration with inferred types

The application follows a streaming-first architecture where AI responses are processed in real-time, artifacts are generated dynamically, and the UI updates progressively as data arrives.