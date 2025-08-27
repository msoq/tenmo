## System Patterns – Tenmo

### Architecture
- Next.js 15 App Router; `experimental.ppr = true`.
- Middleware enforces auth; unauthenticated users are redirected to a guest auth endpoint with the original URL.
- Typed error handling via `ChatSDKError` with surface-based visibility and HTTP status mapping.
- OpenTelemetry registration via `instrumentation.ts` (`serviceName: ai-chatbot`).

### Auth
- NextAuth v5 with two Credentials providers:
  - `credentials`: email/password (bcrypt-ts) using Drizzle queries.
  - `guest`: on-demand guest user creation.
- JWT/session augmented with `user.id` and `user.type` (`guest | regular`).
- Middleware blocks `/login` and `/register` for authenticated non-guest users.

### Data Model (Drizzle ORM)
- Core tables: `User`, `Chat`, `Message_v2(parts, attachments)`, `Vote_v2`, `Document(kind: text|code|sheet)`, `Suggestion`, `Stream`.
- Phrases tables: `UserPhrasesSettings`, `UserPhrasesSettingsTopic` (join), `Topics`.
- Query layer centralizes CRUD and throws `ChatSDKError('bad_request:database', ...)` on failures.
- Transactional updates for phrases settings and join-table replacement with deduplication.

### AI Integration
- Provider registry in `lib/ai/providers.ts`, keyed by `PROVIDER_NAME`; startup error if unknown.
- Models: `chat-model`, `chat-model-reasoning` (wrapped with `extractReasoningMiddleware`), `title-model`, `artifact-model`.
- `systemPrompt` composes geo hints and appends artifacts guidance for non-reasoning models.
- Entitlements limit messages and model access by `UserType`.

### Artifacts Workflow
- Use artifacts for substantial content/code/sheets; default code language is Python.
- Do not auto-update immediately after creation; wait for explicit user request.

### UI Composition
- Tailwind CSS + Radix primitives; shadcn-style `components/ui/*`; Geist fonts.
- Prefer Tailwind's animation utilities over custom CSS files for animations.

### Testing
- Playwright starts the dev server and probes `/ping` (allowed by middleware) before tests.
- Projects: e2e and routes; fully parallel; 240s timeouts.

### Coding Conventions
- TS config strict; path alias `@/*`; prefer early returns and explicit types for exported APIs.
- Use `server-only` and `'use server'` where relevant.
- Keep components small/composable; align with `components/ui/*` patterns.

### Observability & Errors
- API routes should convert thrown `ChatSDKError` to responses using `toResponse()`.
- Database errors are logged and return generic user messages; other surfaces return user-friendly details.


