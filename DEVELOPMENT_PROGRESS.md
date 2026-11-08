# Socially / Instagram Clone — Development Progress

## Status (2026-11-08)
This repository currently contains a **working MVP** (`http://localhost:3000` when running locally) built with:
- **Frontend:** vanilla HTML/CSS/JS SPA (`public/`)
- **Backend:** Node.js + Express (`server/index.js`)
- **Data:** local JSON file store (`data/db.json`, gitignored runtime)
- **Auth:** `express-session` + `bcryptjs`
- **Uploads:** Multer + URL fallback
- **Repo:** https://github.com/Cynet04/Instagram-Clone (`main`)

The large product spec requesting **React + TypeScript + Vite + Tailwind + Supabase (Auth/Postgres/Storage/Realtime), PWA hardening, Vitest/RTL/Playwright, admin, full privacy/RLS, reels/stories expiry enforcement, etc.** is **not implemented** in this codebase. Proceeding as “Continue current MVP” per user direction.

## Implemented (MVP)
- Auth: signup/login/logout, session-aware UI, protected actions.
- Profiles: view/edit profile (name/bio/avatar), follow/unfollow, counts, posts/saved tabs (owner), deep links.
- Posts: create (file or URL, caption, CSS filter), feed pagination/infinite scroll, detail dialog/deep links, like/save/comment/comment-like, owner delete/comment moderation.
- Stories: seed + URL-based create, viewer modal with keyboard/navigation and focus handling.
- Messaging: conversations/thread persistence UI with optimistic send and timestamps (local store, not Supabase Realtime).
- Notifications: like/comment/follow/comment-like events, unread badge/title count, mark read (all/selected), deep links, inline follow.
- Search/Explore: users/posts/hashtags, follow-state hydration in search, explore grid/filter.
- UX/A11y: responsive/mobile nav, dark mode persistence, toasts, loading/empty/error states, dialog focus/ARIA refinements, share/copy links, health indicator.
- Verification: `node --check` on modified JS; `/api/health` checks; feature commits pushed to `origin/main`.

## Not Implemented / Gaps vs Requested Spec
- React/TypeScript/Vite/Tailwind/React Router/TanStack Query/Lucide migration.
- Supabase Auth/PostgreSQL schema/RLS/Storage/Realtime (requires project + env vars; **no secrets fabricated**).
- Full schema from spec (post media tables, reels, highlights, collections, follow requests/privacy enforcement, reports/admin audit, etc.).
- Real-time messaging/notifications via Supabase Realtime.
- PWA manifest/service worker/offline fallback with safe caching rules.
- Automated tests (Vitest/RTL/Playwright).
- Production-grade security (RLS, server-side upload validation policies, rate limits, CSRF hardening beyond session defaults, etc.).
- Admin dashboard with secure authorization.

## Next Steps (MVP-safe)
1. Keep `/api/health` green and commit/push each verified improvement.
2. Add small, high-value refinements (a11y, error handling, route polish, docs).
3. If Supabase rewrite is approved, create a migration plan/branch, scaffold Vite React TS app, and require `SUPABASE_URL`/`SUPABASE_ANON_KEY` + schema migrations before claiming feature parity.
