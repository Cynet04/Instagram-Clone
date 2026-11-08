# TODO

## Immediate (MVP)
- [ ] Continue small verified Phase 9+ refinements (a11y/perf/UX/routes) with tests/checks and commits.
- [ ] Improve README with accurate local setup, routes, limitations, and health check.
- [ ] Add CHANGELOG entries for notable work.

## Blocked / Requires Decision & External Setup
- [ ] Confirm architecture direction for full “Socially” spec (rewrite vs incremental migration).
- [ ] Provision Supabase project (never commit secrets). Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and server/service config only in secure env, never frontend).
- [ ] Design/apply normalized Postgres schema + RLS policies + Storage buckets/policies + Realtime subscriptions.
- [ ] Scaffold React + TypeScript + Vite + Tailwind + Router + TanStack Query; migrate features with tests.
- [ ] Implement PWA (manifest, icons, service worker, offline fallback) with safe caching (no private/auth data).
- [ ] Add Vitest/RTL/Playwright coverage and CI-quality checks.
- [ ] Implement privacy/security features (private accounts/follow requests, blocking/reports, admin authz, audit).
