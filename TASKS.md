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
- [x] Notifications (like/comment/follow/comment-like events, list, unread badge, mark-read)
- [x] Infinite scroll / pagination (feed offset/limit + intersection observer)
- [x] CSS image filters (selectable on upload, rendered in feed/explore/profile)
- [x] Real-time-ish message persistence UI (conversations, thread view, send)
- [x] Story viewer modal (clickable stories, prev/next/close)
- [x] Follow/unfollow (API + profile counts + follow notifications)
- [x] Profile edit (bio/name/avatar URL, persisted via `/api/me/profile`)
- [x] Post delete (owner-only delete, local upload cleanup, notification/save cleanup)
- [x] Hashtag links/search (caption hashtag parsing + clickable search)
- [x] Comment likes (per-comment like API, UI counters, notifications)
- [x] Profile saved tab (owner profile tabs: Posts/Saved)
- [x] Story creation (URL-based add-story API + feed story composer)
- [ ] Suggested users follow actions
- [ ] Additional autonomous features

## Progress Log
- 2026-11-08: Project initialized (Node/Express + vanilla frontend + JSON store). Phase 1-8 core scaffold implemented; server verified (`/api/health` OK).
- 2026-11-08: Phase 9 started — dark mode toggle added; nav encoding normalized; server health verified.
- 2026-11-08: Bookmarks/saved posts added (per-user save API, saved view, feed save state).
- 2026-11-08: Notifications added for likes/comments with unread badge and mark-read. Server restarted and health verified.
- 2026-11-08: Feed pagination/infinite scroll and CSS image filters added. Server restarted and API verified.
- 2026-11-08: Direct messaging persistence added (conversation/thread/send APIs + UI). `safeUser` helper restored after feed regression; server restarted and health verified.
- 2026-11-08: Story viewer modal added (story dialog, navigation, and story metadata rendering). Health verified.
- 2026-11-08: Follow/unfollow added with follower/following counts, profile action button, and follow notifications. Server restarted and health verified.
- 2026-11-08: Profile edit added (name/bio/avatar URL with API persistence and profile dialog). Server restarted and health verified.
- 2026-11-08: Post delete added for owners with saved/notification cleanup and local upload file removal. Server restarted and health verified.
- 2026-11-08: Hashtag links/search added (caption parsing, clickable tags, hashtag-aware search API). Server restarted and health/search verified.
- 2026-11-08: Comment likes added (comment like endpoint, counters in feed/saved/search payloads, UI buttons, and comment-like notifications). Server restarted and health verified.
- 2026-11-08: Profile saved tab added for owners (Posts/Saved tabs using saved API). Client syntax and server health verified.
- 2026-11-08: Story creation added (authenticated POST `/api/stories`, feed "Your story" composer, story refresh). Server restarted and health verified. Next: suggested users follow actions.
