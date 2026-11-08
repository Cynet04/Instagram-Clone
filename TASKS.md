# Instagram Clone — Autonomous Build Tasks

## Phase 1: Core UI & Layout
- [x] Express server with static frontend
- [x] Instagram-like shell: navbar, feed area, sidebar
- [x] Responsive base styles and placeholders
- [x] Profile page skeleton

## Phase 2: Authentication
- [x] Signup/login endpoints with password hashing (bcryptjs)
- [x] Session handling (express-session)
- [x] Auth-aware UI state

## Phase 3: Image/Post Upload
- [x] Upload form and Multer endpoint
- [x] Caption storage
- [x] Display uploaded posts

## Phase 4: The Feed
- [x] Feed rendering from stored posts
- [x] Like/unlike with counter
- [x] Comments

## Phase 5: User Profiles
- [x] Profile route/view (`/api/users/:username`)
- [x] User post grid

## Phase 6: Stories
- [x] Story UI at top of feed
- [x] Mock story data/viewer seed

## Phase 7: Direct Messaging
- [x] Mock chat UI scaffold
- [x] Local message storage model (DB ready; UI persistence next)

## Phase 8: Search & Explore
- [x] Search users/posts endpoint + UI
- [x] Explore grid

## Phase 9+: Continuous Improvements
- [x] Dark mode toggle (persisted in localStorage)
- [x] Bookmarks/saved posts (API + saved view)
- [x] Notifications (like/comment events, list, unread badge, mark-read)
- [x] Infinite scroll / pagination (feed offset/limit + intersection observer)
- [x] CSS image filters (selectable on upload, rendered in feed/explore)
- [x] Real-time-ish message persistence UI (conversations, thread view, send)
- [ ] Story viewer modal
- [ ] Follow/unfollow
- [ ] Profile edit (bio/avatar)
- [ ] Additional autonomous features

## Progress Log
- 2026-11-08: Project initialized (Node/Express + vanilla frontend + JSON store). Phase 1-8 core scaffold implemented; server verified (`/api/health` OK).
- 2026-11-08: Phase 9 started — dark mode toggle added; nav encoding normalized; server health verified.
- 2026-11-08: Bookmarks/saved posts added (per-user save API, saved view, feed save state).
- 2026-11-08: Notifications added for likes/comments with unread badge and mark-read. Server restarted and health verified.
- 2026-11-08: Feed pagination/infinite scroll and CSS image filters added. Server restarted and API verified.
- 2026-11-08: Direct messaging persistence added (conversation/thread/send APIs + UI). `safeUser` helper restored after feed regression; server restarted and health verified. Next: story viewer modal.
