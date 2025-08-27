## Project Brief – Tenmo

### Vision
An AI-powered language learning platform combining conversational practice with structured phrase training and actionable feedback.

### Objectives
- Enable natural chat-based learning with multi-provider LLMs.
- Provide topic-driven phrase practice aligned to CEFR levels (A1–C2).
- Offer immediate, specific feedback on user translations.
- Support guest onboarding and smooth upgrade path to regular accounts.
- Persist chats, messages, artifacts (text/code/sheet), and user settings.
- Ensure predictable error handling and observability.

### Scope (Initial)
- Web app on Next.js 15 (App Router, PPR on) with Tailwind UI.
- Postgres persistence via Drizzle ORM + migrations.
- NextAuth v5 credentials + guest flow enforced by middleware.
- AI via Vercel AI SDK with pluggable providers (OpenAI, Google, xAI, Anthropic, OpenRouter).
- E2E tests via Playwright; OTel via @vercel/otel.

### Non-Goals (Phase 1)
- Third-party OAuth providers and billing/subscriptions.
- Native mobile apps.
- Complex moderation and analytics.

### Success Criteria
- Reliable guest sign-in and frictionless first-run experience.
- Phrase generation aligned to user settings and topics.
- Clear feedback cycles and artifact editing without confusion.
- Stable migrations and reproducible local dev setup.

