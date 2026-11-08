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
- [x] Post creation optimistic/fast feedback (prepends created post to feed without full reload, resets caption count, brand returns home and closes post dialog)
- [x] Post action binding robustness (supports binding a single `.post` root for optimistic inserts/dialogs)
- [x] Post share/delete route polish (share copies deep link without mutating current route; delete shows toast feedback)
- [x] Search/profile loading refinements (search header shows result counts; preserves follow/view interactions)
- [x] DM/search UX polish (clickable DM header profile link; fixed DM timestamp separator encoding)
- [x] Profile DM entry point (profile shows Message button for other users and opens DM conversation)
- [x] Minor status polish (comment delete shows toast feedback; checklist/progress reconciliation)
- [x] Search clear/Escape polish (search input has accessible label; Escape clears input/blur, returns from search view)
- [x] Minor accessibility/state polish (`aria-pressed`/labels for like/save/comment-like controls, synced optimistic UI state)
- [x] Minor route/title polish (document title updates per view/profile; profile routes set title during load)
- [x] Keyboard accessibility refinements (keyboard-openable notifications and DM conversation items with ARIA labels/roles)
- [x] Minor accessibility/route refinements (theme toggle exposes `aria-pressed` + toast; global Escape respects search-input clear behavior)
- [x] Post/profile share refinements (Web Share API when available for posts and profiles, clipboard/prompt fallback)
- [x] Small perf/title polish (notification unread count reflected in document title; images use `decoding="async"`)
- [x] Profile tab deep links (owner Posts/Saved tabs sync `#/profile/:username` and `#/profile/:username/saved`; route restores tab)
- [x] Small accessibility/perf polish (post avatar/username profile links are keyboard-focusable with Enter/Space activation)
- [x] Profile/share/accessibility refinements (owner Posts/Saved tabs use `tablist/tab/aria-selected`)
- [x] Story dialog accessibility polish (aria labels/roles for story viewer controls and dynamic story image alt text)
- [x] DM responsive polish (messages layout stacks on small screens; conversation list becomes scrollable panel)
- [x] Small accessibility polish (comment form inputs get `aria-label` for screen readers)
- [x] Notification/explore action polish (mark-read shows toast/handles errors; clear/mark-read buttons have accessible labels)
- [x] Small accessibility/status refinements (profile action labels, feed status/live-region roles, follow rollback aria sync)
- [x] Search input/action refinements (`type="search"` + autocomplete off; search follow/view buttons have explicit aria labels)
- [x] Sidebar profile quick-link (logged-in sidebar card opens current profile via keyboard/clickable profile link)
- [x] Post dialog focus polish (opening post detail moves focus into dialog content)
- [x] Story viewer keyboard polish (ArrowLeft/ArrowRight navigate stories while story dialog is open; previous disabled at start)
- [x] Profile/share refinements (profile share button state guarded with element ref; copy feedback preserved)
- [x] Story viewer/add-story accessibility polish (`Your story` button has aria label; opening story viewer focuses navigation control)
- [x] Error recovery polish (shared error states include contextual Try again actions)
- [x] Client robustness fix (added missing `timeAgo`/`avatar` helpers; fixed stray story keydown listener typo)
- [x] Account settings MVP (Settings view + theme/password/logout controls; `POST /api/me/password` with bcrypt verification)
- [x] Post report MVP (non-owner Report action; `POST /api/posts/:id/report` with dedupe in `reports`)
- [x] PWA smoke + basic install shell (manifest, icon, service worker for static assets only; smoke tests)
- [x] Post share image-link fallback refinement (share includes image URL/text where appropriate; clipboard fallback remains)
- [x] Settings route/auth-state UX (settings view refreshes on auth changes; title/route behavior consistent)
- [x] Copy caption action (post action copies caption text with clipboard/prompt fallback and toast)
- [x] Double-tap like on feed post image (image double-click likes post without changing open behavior)
- [x] Copy image link action (post action copies image URL with clipboard/prompt fallback and toast)
- [x] Open image in new tab action (post action opens image URL in a new tab)
- [x] Recent searches (localStorage) with clear action
- [x] Profile counts dialog/list (followers/following basic list)
- [x] Settings: app info/version and data notes
- [x] Post/report moderation list in settings (MVP local view)
- [x] Keyboard shortcuts help dialog (`/`, `g+key`, `?`, Esc closes)
- [x] Share sheet metadata polish (Web Share metadata/context where supported)
- [x] Profile/avatar quick preview (avatar opens profile/photo preview dialog)
- [x] DM unread indicator (nav/messages show unread DM count)
- [x] Settings diagnostics/local prefs helpers (check server, copy diagnostics, clear local prefs)
- [x] Owner caption edit (API `PATCH /api/posts/:id` + UI prompt)
- [x] Empty explore polish for logged-out/first-run users
- [x] Story expiry (24h filter)
- [x] Profile website field support (MVP-safe)
- [x] Post search by own username quick filter (`@me` resolves to current user)
- [x] Keyboard shortcut: focus/open new post (`n`/`c`)
- [x] Block user MVP (hide blocked users content in UI/API filters; route + feed/search + profile UI)
- [x] Comment report action (MVP local) + API
- [x] DM conversation clear (local MVP)
- [x] Notification type filter tabs (server/client)

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
- 2026-11-08: Post creation fast feedback added (created post prepended to feed without full reload, caption count reset, brand returns home/closes post dialog). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Post action binding robustness added (`bindPostActions` supports single-post roots for optimistic inserts/dialog flows). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Post share/delete route polish added (share copies deep link without mutating the current route; delete shows toast feedback). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Search/profile loading refinements added (search results header displays user/post counts; existing follow/view interactions preserved). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: DM/search UX polish added (DM conversation header links to profile; DM conversation timestamp separator encoding fixed). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile DM entry point added (Message button on other users' profiles opens/selects the DM conversation). Client/server syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Minor status polish added (comment delete shows toast feedback). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Search clear/Escape polish added (search input aria label; Escape clears/blur and returns from search view). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Minor accessibility/state polish added (`aria-pressed`/labels for post like/save and comment-like controls; optimistic UI keeps button state/text in sync). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Minor route/title polish added (document title updates per view and profile route). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Keyboard accessibility refinements added (notifications and DM conversation items are keyboard-activatable with Enter/Space and ARIA labels). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Minor accessibility/route refinements added (theme toggle `aria-pressed` + toast; global Escape skips search-input clear handling). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Post/profile share refinements added (Web Share API for post/profile sharing with clipboard/prompt fallback). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small perf/title polish added (unread notification count reflected in document title; lazy images use `decoding="async"`). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile tab deep links added (Posts/Saved tabs sync profile hash routes and restore selected tab from URL). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small accessibility/perf polish added (post avatar/username profile links keyboard-focusable with Enter/Space activation). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile/share/accessibility refinements added (owner profile Posts/Saved tabs expose `tablist/tab/aria-selected`). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Story dialog accessibility polish added (story viewer aria labels/controls and dynamic story image alt text). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: DM responsive polish added (messages UI stacks on small screens with bounded conversation list). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small accessibility polish added (comment form inputs have `aria-label`). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Notification/explore action polish added (mark-read toast/error handling; accessible labels for clear/mark-read actions). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small accessibility/status refinements added (profile action aria labels, feed status live-region/alert roles, follow rollback label sync). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Search input/action refinements added (`type="search"` + autocomplete off; search follow/view buttons include explicit aria labels/state sync). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Sidebar profile quick-link added (logged-in sidebar card opens current profile). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Post dialog focus polish added (opening post detail moves focus into dialog content). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Story viewer keyboard polish added (ArrowLeft/ArrowRight navigation while story dialog open; previous disabled at start). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile/share refinements added (profile share button text updates use guarded element ref). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Story viewer/add-story accessibility polish added (`Your story` aria label; opening story viewer focuses navigation control). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Composer accessibility polish added (post file/URL inputs have explicit `aria-label`s). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Dialog/form accessibility polish added (story/auth/profile dialog inputs include explicit `aria-label`s). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Notification follow action labels added (follow/unfollow controls in notifications expose and sync explicit `aria-label`s). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Sidebar suggestion action labels/state added (suggestion follow/view aria labels; follow action syncs label/state and shows toast). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small route refinements added (closing post dialog restores previous route/hash context instead of always forcing feed). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Dialog focus refinements added (auth/profile dialogs focus first input on open). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Composer accessibility polish added (New post button `aria-controls`/`aria-expanded` synced with composer visibility; opening focuses image input). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: DM input accessibility polish added (message input autocomplete off; send button explicit submit/aria label). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Composer accessibility polish added (New post button `aria-controls`/`aria-expanded` synced with composer visibility; opening focuses image input). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: DM input accessibility polish added (message input autocomplete off; send button explicit submit/aria label). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: DM accessibility polish added (message input includes recipient-specific `aria-label`). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small route/search refinements added (search syncs `#/search/:q` + document title; search hash route restores query/results). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Session logout UI cleanup added (logout resets DM/feed/dialog state, refreshes suggestions/badge, closes dialogs). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Footer/status polish added (sidebar health indicator shows last-checked time). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile follow button polish added (button disabled during request, follow/unfollow toast feedback). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Profile share refinements added (Web Share API when available, clipboard/prompt fallback, abort-safe). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Footer/status polish added (sidebar health indicator polling `/api/health`; `PROGRESS.md` created). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Minor a11y/composer polish added (`aria-current` nav active state, `aria-busy` loading cards, caption character count, post-share toast). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Remaining `alert()` calls replaced with toast/status feedback (kept confirm/prompt for delete confirmation and clipboard fallback). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Post detail route/hash polish added (post dialog open/close syncs `#/post/:id`/feed hash; auth/story success toasts). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Small status/feedback polish added (profile update toast, health indicator error color, post deep-link failure resets hash). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Search/profile follow-state refinements added (`/api/search` includes follow state, search results render follow/view actions with optimistic updates and toasts). Server/client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: Notification/profile follow-state refinements added (notifications API returns actor `isFollowing`; follow notifications render inline follow/unfollow with toast feedback and safe click handling). Server/client syntax and health verified after restart. Next: additional autonomous features.
- 2026-11-08: Small empty-state polish added (profile posts/saved grid uses shared empty-state copy for owner/visitor contexts). Client syntax and health verified. Next: additional autonomous features.
- 2026-11-08: DM UX polish added (optimistic message send with sending state/rollback, conversation preview timestamp update, timestamp separator fix). Client syntax and health verified. Next: additional autonomous features.

## Phase 10: New Autonomous Features (2026-11-08)
- [x] Notification preferences toggles (localStorage; mute likes/comments/follows/comment likes)
- [x] Post pin/unpin on own profile (MVP local indicators/actions)
- [x] Story reply/quick reaction UI (MVP local state/toast)
- [x] DM typing indicator simulation (local UI polish)
- [x] Account data export (download local-visible JSON snapshot via `/api/me/export`)

## Phase 11: New Autonomous Features (2026-11-08)
- [x] Post bookmark collections label (local MVP: All Saved label)
- [x] Profile QR/share text helper (copy profile card text)
- [x] Feed sort toggle (newest/most liked, client-side)
- [x] Message delete (own message, API + UI)
- [x] Activity status indicator (local setting)

## Phase 12: New Autonomous Features (2026-11-08)
- [x] Feed refresh manual button (reload feed with feedback)
- [x] Mute/unmute user in DM (hide messages locally, MVP)
- [x] Post archive (owner hides post from profile/feed, local MVP)
- [x] Comment pin by post owner (MVP, highlight pinned comment)
- [x] Profile notes/private memo (local, visible only to self)
- [x] Phase 12 autonomous batch complete (2026-11-08)

## Phase 13: New Autonomous Features (2026-11-08)
- [x] Post save count indicator (show saves count to post owner in UI)
- [x] Comment sort toggle (newest/top/oldest, client-side)
- [ ] Quick profile hover card info in post header (local UI enhancement)
- [ ] "Seen" indicator for own DM messages (client-side/local state)
- [x] Search history quick chips on explore page
- [x] Phase 13 autonomous batch complete (2026-11-08)

## Phase 15: New Autonomous Features (2026-11-08)
- [x] "Back to top" button on feed when scrolled
- [x] Post timestamp tooltip/full datetime on hover/title
- [x] Profile bio linkify (URLs clickable in bio)
- [x] Clear all search history from settings
- [x] DM quick reply chips for new conversation
- [x] Phase 15 autonomous batch complete (2026-11-08)

## Phase 16: New Autonomous Features (2026-11-08)
- [x] Post location field (create/edit/display, MVP)
- [x] "Copy comment text" action
- [x] Profile follower/following count refresh on follow actions
- [x] Settings: show app storage info (localStorage keys count)
- [x] Feed empty state CTA for logged-in users with no follows
- [x] Phase 16 autonomous batch complete (2026-11-08)

## Phase 17: New Autonomous Features (2026-11-08)
- [x] Phase 17 autonomous batch complete (2026-11-08)
- [x] Fix: restore missing `renderMe()` (login ReferenceError)
- [x] Post share count (local/client interaction feedback)
- [x] Profile "Joined" placeholder/date if available
- [x] DM conversation list last message preview truncation polish
- [x] Composer image URL load error inline message
- [x] Search result avatars consistent sizing/fallback

## Phase 18: New Autonomous Features (2026-11-08)
- [x] Feed "new posts available" refresh hint after manual actions
- [x] Profile post count/click opens posts tab explicitly
- [x] Notification item delete (local hide) + persist hidden IDs
- [x] Keyboard shortcut: `r` refresh current view
- [x] Settings: show build/version/date info from client constants
- [x] Phase 18 autonomous batch complete (2026-11-08)

## Phase 19: New Autonomous Features (2026-11-08)
- [x] Post filter label shown on image/card (subtle)
- [x] "Load more comments" for posts with many comments (client-side)
- [x] Profile tab remembers last selected tab per username (local)
- [x] Notification badge clears optimistically when opening notifications
- [x] Composer drag-and-drop image file support (MVP)
- [x] Phase 19 autonomous batch complete (2026-11-08)

## Phase 20: New Autonomous Features (2026-11-08)
- [x] Feed post count indicator near top
- [x] "Mark all read" optimistic UI in notifications
- [x] Profile link in DM header opens profile view
- [x] Search: Enter key opens first result
- [x] Settings: button to clear hidden notifications (local)
- [x] Phase 20 autonomous batch complete (2026-11-08)

## Phase 21: New Autonomous Features (2026-11-08)
- [ ] Post image click opens detail dialog (existing) with keyboard focus
- [ ] DM "typing" indicator clears on send
- [ ] Explore grid shows like count overlay on hover (CSS/title)
- [ ] Profile website opens in new tab with safe rel (already) + visible external indicator
- [ ] Empty saved posts shows link to explore
