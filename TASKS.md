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
- [x] Suggested users follow actions (sidebar follow/view with follow state)
- [x] Image URL post fallback polish / upload validation
- [x] Clickable profile links on posts/comments
- [x] Explore search/filter integration (search input filters explore grid; clear)
- [x] Post detail/open interactions (API `/api/posts/:id`, feed/profile/explore open dialog)
- [x] Comment delete (owner can delete own comments or comments on own post; API + UI)
- [x] Profile deep links in URL hash (route/hash handling for views and `/profile/:username`)
- [x] Optimistic UI updates (like/save/comment-like/comment-create/comment-delete with rollback)
- [x] Loading/empty states (shared state cards/spinner + improved feed/explore/saved/notifications/messages states)
- [x] Route-aware nav active state + image fallback polish (nav highlights active view; avatars/post images use fallback on load error)
- [x] Share/copy profile links (profile page copies deep-link URL with clipboard fallback)
- [x] Notification deep links/open context (notifications open related post dialog or actor profile)
- [x] Composer UX polish (post preview/filter preview, inline status/errors, submit/reset states)
- [x] Keyboard/focus/dialog refinements (shared dialog open/close with focus restore, Escape closes open dialogs, comment focus uses event handler)
- [x] Image accessibility/fallback labels (descriptive post/avatar alt text, explore/profile/story aria labels, grid image fallback handling)
- [x] Lightweight client validation (auth username/password constraints, story/profile/avatar URL checks, profile cancel uses dialog helper)
- [x] Profile follow optimistic polish (follow button/follower count update immediately with rollback)
- [x] DM/notification timestamp polish (conversation/message timestamps shown; message time styling)
- [x] Feed image open affordance (hover feedback + post detail title)
- [x] Keyboard-accessible post open (grid/explore/feed images focusable via keyboard with Enter/Space)
- [x] Search loading/empty-state polish (search shows loading state, clearer empty users/posts results, error state)
- [x] Post share/copy link + deep-link route (post Share copies `#/post/:id`; route opens post dialog)
- [x] Reusable toast/status polish (toast element + share/copy feedback for post/profile links)
- [x] Profile loading/error polish (profile shows loading state, clearer login/empty/error states, avatar fallback)
- [x] Lightweight mobile nav polish (scrollable/wrapped nav, responsive spacing, nav labels preserve auth/theme state)
- [x] Notification read-state refinements (API supports per-notification IDs/unread count; UI marks opened notification read and syncs badge)
- [ ] Additional autonomous features (e.g., search/profile loading refinements, footer/status polish, post creation optimistic feedback)

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
- 2026-11-08: Story creation added (authenticated POST `/api/stories`, feed "Your story" composer, story refresh). Server restarted and health verified.
- 2026-11-08: Suggested users sidebar now supports follow/view actions with follow-state hydration. Client syntax verified.
- 2026-11-08: Post creation accepts file or validated image URL fallback; feed posts/comments now have clickable profile links. Server restarted and health verified.
- 2026-11-08: Explore integrates with search input and clear action; explore results show clickable profile-linked images. Client syntax verified.
- 2026-11-08: DM/notification timestamp polish added (conversation/message timestamps rendered in DM UI; message time styling). Client syntax and health verified.
- 2026-11-08: Feed image open affordance added (hover feedback and post-detail title on post images). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Keyboard-accessible post open added (feed/profile/explore post images are focusable with Enter/Space support and ARIA labels). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Search loading/empty-state polish added (search loading indicator, clearer users/posts empty results, and error handling). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Post share/copy link and deep-link route added (post Share copies `#/post/:id`; hash route opens post detail dialog). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Reusable toast/status polish added (global toast UI and copy/share feedback for post/profile links). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile loading/error polish added (profile loading indicator, clearer login/empty/error states, avatar fallback, and toast on follow failure). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Lightweight mobile nav polish added (scrollable nav/actions on small screens, responsive spacing/profile layout, auth label rendering preserved). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Notification read-state refinements added (`/api/notifications/read` supports per-notification IDs and returns unread; UI marks opened notifications read, syncs badge, uses toast errors). Server/client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Footer/status polish added (sidebar health indicator polling `/api/health`; `PROGRESS.md` created). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Minor a11y/composer polish added (`aria-current` nav active state, `aria-busy` loading cards, caption character count, post-share toast). Client syntax and health verified. Next: additional autonomous features.
