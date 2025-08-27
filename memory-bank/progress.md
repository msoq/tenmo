## Progress – Tenmo

### What works
- Next.js 15 app with PPR and middleware-based auth.
- Guest and regular credential flows via NextAuth v5.
- Drizzle ORM schema and queries for chats, messages, documents, phrases settings, topics.
- AI provider registry with reasoning middleware and prompts.
- Playwright e2e setup bootstrapping via `/ping`.
- Telemetry registered via `@vercel/otel`.

### What’s left / Future
- Expand entitlements for paid tiers (placeholder in `entitlements.ts`).
- Broaden artifacts editing flows if needed (beyond Python default).
- Additional analytics/metrics and progress tracking visualizations.

### Known issues / Considerations
- Rely on env `PROVIDER_NAME`; misconfiguration throws at startup (intentional).
- Deprecated message tables exist; `Message_v2` is canonical path.

### Decision log (recent)
- Adopted Memory Bank to bootstrap Cursor after resets.
- Keep Tailwind as the primary animation/styling mechanism.

