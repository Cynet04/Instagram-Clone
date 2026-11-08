# Socially (Instagram Clone MVP)

Working local MVP inspired by Instagram, built as a single responsive SPA.

## Current stack
- Frontend: vanilla HTML/CSS/JS (`public/`)
- Backend: Node.js + Express (`server/index.js`)
- Data: local JSON file (`data/db.json`, runtime, gitignored)
- Auth: `express-session` + `bcryptjs`
- Uploads: Multer + image URL fallback

## Run locally (Windows PowerShell)
```powershell
cmd /c "npm install"
cmd /c "npm start"
```
Then open: **http://localhost:3000**

Health check: `GET /api/health` ? `{"ok":true}`

Demo users (seeded on first run): `demo`, `alex`, `sam` — password `password123`.

## Implemented MVP features
Auth/session, profiles (edit/follow), posts (file/URL + filters), feed pagination/infinite scroll, likes/comments/comment likes/saves/delete, stories (URL + viewer), DMs (local persistence UI), notifications, search/explore/hashtags, deep-link routes, dark mode, responsive UI, toasts/loading/empty/error states, and a11y refinements.

## Limitations / not implemented
This is **not** the requested React+TypeScript+Vite+Tailwind+Supabase “Socially” stack. It has no Supabase Auth/Postgres/RLS/Storage/Realtime, no PWA service worker, no Vitest/RTL/Playwright suite, and no production admin/security model. See `DEVELOPMENT_PROGRESS.md` and `TODO.md`.

## Safety/config
- Never commit secrets, `.env`, tokens, or runtime data (`data/`, `uploads/` contents except `.gitkeep` are gitignored).
- Supabase migration requires explicit approval and provisioned credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); do not fabricate keys.