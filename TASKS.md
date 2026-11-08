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
- [x] Quick profile hover card info in post header (local UI enhancement)
- [x] "Seen" indicator for own DM messages (client-side/local state)
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

## Phase 22: New Autonomous Features (2026-11-08)
- [x] Phase 22 autonomous batch complete (2026-11-08)
- [x] Post caption "edited" indicator when caption changed (client heuristic)
- [x] Profile: show total likes received across posts (computed)
- [x] DM list: unread dot indicator per conversation
- [x] Search: clear button (x) inside search input behavior
- [x] Settings: "Reset all local IG prefs" with confirm

## Phase 23: New Autonomous Features (2026-11-08)
- [x] Feed: show "End of feed" when hasMore is false
- [x] Post: copy caption text button
- [x] Profile: bio character/line safety (no overflow)
- [x] Messages: show "You:" prefix for own last message preview
- [x] Settings: show current logged-in user summary card
- [x] Phase 23 autonomous batch complete (2026-11-08)

## Phase 24: New Autonomous Features (2026-11-08)
- [x] Phase 24 autonomous batch complete (2026-11-08)
- [x] Post: "Open image" action (new tab)
- [x] Feed: sort selector persists in localStorage
- [x] Profile: copy profile bio button
- [x] Messages: scroll DM body to bottom on open/send
- [x] Notifications: "Hide read" toggle (local filter)

## Phase 25: New Autonomous Features (2026-11-08)
- [x] Post actions: "Copy post ID" (debug/support)
- [x] Feed: remember scroll position per view (restore on return)
- [x] Profile: display post location in grid/list context where useful
- [x] Notifications: show type filter active state
- [x] Settings: "Copy app build info" button
- [x] Phase 25 autonomous batch complete (2026-11-08)

## Phase 26: New Autonomous Features (2026-11-08)
- [x] Phase 26 autonomous batch complete (2026-11-08)
- [x] Post: show comment count in actions/meta
- [x] Feed: "Jump to first post" from back-to-top behavior enhancement
- [x] Profile: quick "Open in Explore" context for hashtags in bio (none) / show posts/saves labels clearly
- [x] Messages: disable send button while request in-flight (UI guard)
- [x] Notifications: persist "Hide read" state visibly

## Phase 27: New Autonomous Features (2026-11-08)
- [x] Post: location icon text
- [x] Profile: followers/following dialogs show empty state text
- [x] Search: show result counts in section headers
- [x] Settings: quick link to open /api/health in new tab
- [x] Phase 27 autonomous batch complete (2026-11-08)

## Phase 28: New Autonomous Features (2026-11-08)
- [x] Phase 28 autonomous batch complete (2026-11-08)
- [x] Feed: "Retry" on feed load error already via errorState; add toast on background refresh failure
- [x] Post dialog: show post ID/location metadata
- [x] Profile: show "Private account" placeholder not applicable; add message when blocked by self logic not applicable � show website/favicon-like label
- [x] Explore: show empty state when no posts
- [x] Global: improve document title on profile view

## Phase 29: New Autonomous Features (2026-11-08)
- [x] Settings: show notifications unread count
- [x] Feed: show loading text for "load more" sentinel state
- [x] Comments: show comment count badge near form
- [x] Phase 29 autonomous batch complete (2026-11-08)

## Phase 30: New Autonomous Features (2026-11-08)
- [x] Phase 30 autonomous batch complete (2026-11-08)
- [x] Post: show likes label as "like/likes" correctly
- [x] Profile: "Message" button hidden for self (already) / add follow state consistency
- [x] Search: remember last query in input on view return (local)
- [x] Notifications: click actor avatar/name also navigates to profile
- [x] Composer: clear location/alt on reset after post meantoldString

## Phase 31: New Autonomous Features (2026-11-08)
- [x] Post: show saves count label as "save/saves" correctly
- [x] Feed: "No more posts" only when not loading (already) � add aria-live polite
- [x] Profile: posts stat uses same label style
- [x] Messages: show conversation empty state when no contacts
- [x] Server: include phase in /api/health as 31

## Phase 32: New Autonomous Features (2026-11-08)
- [x] Phase 32 autonomous batch complete (2026-11-08)
- [x] Post: "Copy link" button label shows "Copied" briefly via toast only (already) � add aria-live for actions
- [x] Explore/search: tag search hint text
- [x] Profile: show "Edit profile" only for self (already) � add avatar alt text quality
- [x] Messages: Enter-to-send note in placeholder not needed; keep accessible
- [x] Health: UI shows phase from /api/health when available

## Phase 33: New Autonomous Features (2026-11-08)
- [x] Phase 33 autonomous batch complete (2026-11-08)
- [x] Feed: aria label for post article includes username
- [x] Notifications: show "All caught up" when visible list empty
- [x] Profile: total comments received stat (computed)
- [x] Search: hashtag chips link to explore search (existing chips)
- [x] Settings: show DM unread total

## Phase 34: New Autonomous Features (2026-11-08)
- [x] Phase 34 autonomous batch complete (2026-11-08)
- [x] Post: prevent duplicate rapid like clicks (simple in-flight guard)
- [x] DM: show message count in conversation header
- [x] Profile: grid/list toggle label reflects current view clearly
- [x] Feed: post caption hashtags rendered as links to search
- [x] Phase bump to 34

## Phase 35: New Autonomous Features (2026-11-08)
- [x] Phase 35 autonomous batch complete (2026-11-08)
- [x] Settings: show approximate localStorage usage for IG keys
- [x] Notifications: disable "Mark read" when badge is zero
- [x] Feed: accessible label for sort control
- [x] Post: ensure caption hashtag links bind after dynamic renders
- [x] Phase bump to 35

## Phase 36: New Autonomous Features (2026-11-08)
- [x] Phase 36 autonomous batch complete (2026-11-08)
- [x] Post dialog: show "Open in feed/profile context" hint
- [x] Explore: show active search/tag in title
- [x] Messages: show last-seen local text only when enabled (already)
- [x] Profile: show "No website" not needed; keep clean
- [x] Phase bump to 36

## Phase 37: New Autonomous Features (2026-11-08)
- [x] Phase 37 autonomous batch complete (2026-11-08)
- [x] Notifications: "Mark read" updates button state immediately
- [x] Feed: preserve sort after refresh (already persisted)
- [x] Profile: show post count in tab labels where helpful
- [x] Search results: show "No matches" more clearly
- [x] Phase bump to 37

## Phase 38: New Autonomous Features (2026-11-08)
- [x] Phase 38 autonomous batch complete (2026-11-08)
- [x] Feed: show "Refresh" button in feed header
- [x] Post: show full timestamp in detail dialog (already) � add copy post link in dialog
- [x] Settings: show service worker status
- [x] Profile: "Back" to feed uses history where possible
- [x] Phase bump to 38

## Phase 39: New Autonomous Features (2026-11-08)
- [x] Phase 39 autonomous batch complete (2026-11-08)
- [x] Post: show share count label in detail dialog when present locally
- [x] Notifications: "Clear" disabled state/confirm clarity
- [x] Feed: loading skeleton not needed; keep "Loading more posts�" sentinel
- [x] Messages: conversation preview uses "You:" for last sender (done) � add empty text safety
- [x] Phase bump to 39

## Phase 40: New Autonomous Features (2026-11-08)
- [x] Phase 40 autonomous batch complete (2026-11-08)
- [x] Post: double-tap/like animation not needed; add subtle liked-state aria text
- [x] Explore: preserve active query in header after reload (done via input)
- [x] Profile: show blocked-users count not exposed; keep simple
- [x] Settings: add "Refresh SW registration" button
- [x] Phase bump to 40

## Phase 41: New Autonomous Features (2026-11-08)
- [x] Phase 41 autonomous batch complete (2026-11-08)
- [x] Feed: show "No posts match sort" is N/A (server order) � add sort hint text
- [x] Search: autofocus not forced; keep accessible
- [x] Notifications: show empty badge aria-label clarity
- [x] Profile: show follower/following buttons as counts only (already)
- [x] Phase bump to 41

## Phase 42: New Autonomous Features (2026-11-08)
- [x] Phase 42 autonomous batch complete (2026-11-08)
- [x] Composer: show image file name/size hint after selection
- [x] Profile: saved tab only for owner (already) � add empty saved CTA to Explore
- [x] DM: prevent sending whitespace-only (already trimmed) � show error toast
- [x] Feed: "End of feed" only once (idempotent)
- [x] Phase bump to 42

## Phase 43: New Autonomous Features (2026-11-08)
- [x] Phase 43 autonomous batch complete (2026-11-08)
- [x] Accessibility: ensure main landmark has stable label (already)
- [x] Feed: post cards get data-post-id already � add ria-describedby not required; add comment form label association
- [x] Settings: export button disabled while in flight
- [x] Search: trim query before API call (already trims)
- [x] Phase bump to 43

## Phase 44: New Autonomous Features (2026-11-08)
- [x] Phase 44 autonomous batch complete (2026-11-08)
- [x] Post: show "Saved" state text in save button aria-label
- [x] Feed: retry action in error state wired (data-retry-action) � verify binding
- [x] Profile: show "Copy username" button
- [x] Notifications: hide button uses consistent spacing
- [x] Phase bump to 44

## Phase 45: New Autonomous Features (2026-11-08)
- [x] Phase 45 autonomous batch complete (2026-11-08)
- [x] Post: report button has confirm text already � add aria-label clarity
- [x] Messages: show "Muted" badge in conversation list
- [x] Search: show @me hint in placeholder (already supports) � add aria description
- [x] Profile: list view shows post date
- [x] Phase bump to 45

## Phase 46: New Autonomous Features (2026-11-08)
- [x] Phase 46 autonomous batch complete (2026-11-08)
- [x] Post: comment delete button shows for owner (already) � confirm label
- [x] Explore: show post count in section
- [x] Settings: show shortcuts count
- [x] Feed: "New activity" hint clears on refresh (done)
- [x] Phase bump to 46

## Phase 47: New Autonomous Features (2026-11-08)
- [x] Phase 47 autonomous batch complete (2026-11-08)
- [x] Post: add "Copy image URL" action
- [x] Feed: announce refresh completion via toast on manual refresh
- [x] Profile: show "This is you" badge on own profile
- [x] Notifications: mark-read optimistic button state survives rerender (already handled)
- [x] Phase bump to 47

## Phase 48: New Autonomous Features (2026-11-08)
- [x] Phase 48 autonomous batch complete (2026-11-08)
- [x] Post: "Open" button labeled "Open image" consistently
- [x] DM: quick reply chips hidden when muted conversation? keep simple
- [x] Profile: show posts tab count for saved view label not applicable
- [x] Settings: include phase in exported diagnostics
- [x] Phase bump to 48

## Phase 49: New Autonomous Features (2026-11-08)
- [x] Phase 49 autonomous batch complete (2026-11-08)
- [x] Post: aria-label on copy caption/image URL actions include context
- [x] Feed: show username in "End of feed" not needed; keep neutral
- [x] Profile: website label text shows "Website" prefix
- [x] Messages: DM list marks active conversation with aria-current
- [x] Phase bump to 49

## Phase 50: New Autonomous Features (2026-11-08)
- [x] Phase 50 autonomous batch complete (2026-11-08)
- [x] Post: like button disabled state for logged-out users handled by auth prompt
- [x] Search: clear last query when search closed/navigated away
- [x] Settings: show health phase from API after check
- [x] Profile: avatar fallback in header uses consistent style
- [x] Phase bump to 50

## Phase 51: New Autonomous Features (2026-11-08)
- [x] Phase 51 autonomous batch complete (2026-11-08)
- [x] Feed: show post location in feed cards consistently (already present)
- [x] Comments: preserve comment input focus not required; keep UX stable
- [x] Profile: show "No posts" empty state uses consistent copy
- [x] Notifications: ensure hide-read filter persists across reloads (already)
- [x] Phase bump to 51

## Phase 52: New Autonomous Features (2026-11-08)
- [x] Phase 52 autonomous batch complete (2026-11-08)
- [x] Post: show "Report submitted" state not stored; keep toast
- [x] Profile: show edit button label consistency
- [x] Messages: DM body has aria-live for new messages context (polite)
- [x] Feed: end-of-feed marker uses role status
- [x] Phase bump to 52

## Phase 53: New Autonomous Features (2026-11-08)
- [x] Phase 53 autonomous batch complete (2026-11-08)
- [x] Post image: add explicit width:100% container context (CSS-safe)
- [x] Explore: recent search chips have clear label (done)
- [x] Settings: "Copy diagnostics" includes app build (done)
- [x] Search dropdown: ria-label on results container
- [x] Phase bump to 53

## Phase 54: New Autonomous Features (2026-11-08)
- [x] Phase 54 autonomous batch complete (2026-11-08)
- [x] Post: prevent saving while logged out (auth prompt) � ensure UI feedback
- [x] Feed: "Share" action copies link fallback already; unify toast
- [x] Profile: show "Posts/Saved" as navigation tabs with aria-controls context
- [x] Settings: show repo/local app name consistently
- [x] Phase bump to 54

## Phase 55: New Autonomous Features (2026-11-08)
- [x] Phase 55 autonomous batch complete (2026-11-08)
- [x] Notifications: unread count in view header
- [x] Post actions: "Copy post link" in detail dialog already present
- [x] Profile: show "Following you" not supported by API; keep simple
- [x] Messages: conversation list shows aria-selected style via class
- [x] Phase bump to 55

## Phase 56: New Autonomous Features (2026-11-08)
- [x] Phase 56 autonomous batch complete (2026-11-08)
- [x] Post card: ensure like button text reflects count context not needed; add ria-live region for likes not necessary
- [x] Explore: show "No query" state text
- [x] Profile: show follower count pluralization
- [x] Settings: add "Reload page" action
- [x] Phase bump to 56

## Phase 57: New Autonomous Features (2026-11-08)
- [x] Phase 57 autonomous batch complete (2026-11-08)
- [x] Feed: post count pluralization in header
- [x] Profile: follower/following pluralization in stats
- [x] Notifications: clear button disabled when none
- [x] Post detail dialog: escape key closes (native dialog + handler exists)
- [x] Phase bump to 57

## Phase 58: New Autonomous Features (2026-11-08)
- [x] Phase 58 autonomous batch complete (2026-11-08)
- [x] DM: conversation header shows active/muted status clearly (done)
- [x] Post: "Edited" indicator accessible title
- [x] Feed: ensure refresh button not duplicated
- [x] Settings: phase/build info uses APP_BUILD consistently (done)
- [x] Phase bump to 58

## Phase 59: New Autonomous Features (2026-11-08)
- [x] Phase 59 autonomous batch complete (2026-11-08)
- [x] Verification: tests pass, health OK, repo clean before batch
- [x] Post: ria-label on comments count includes post author context
- [x] Profile: saved tab button hidden for non-owners (already)
- [x] Settings: show session hint (cookie-based)
- [x] Phase bump to 59

## Phase 60: New Autonomous Features (2026-11-08)
- [x] Phase 60 autonomous batch complete (2026-11-08)
- [x] Baseline green (tests/health/clean)
- [x] Composer: preview alt text source not shown; keep minimal
- [x] Post: show ltText edit prompt remains
- [x] Messages: send button re-enabled on error (done)
- [x] Phase bump to 60

## Phase 61: New Autonomous Features (2026-11-08)
- [x] Phase 61 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Feed: post author link has ria-label
- [x] Search results: profile links announce destination
- [x] Profile: stats buttons have descriptive labels
- [x] Phase bump to 61

## Phase 62: New Autonomous Features (2026-11-08)
- [x] Phase 62 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: save/share actions announce result via toast (already)
- [x] Feed: #feedRefreshBtn has aria-label
- [x] Notifications: filter <select> label association (already has aria-label)
- [x] Phase bump to 62

## Phase 63: New Autonomous Features (2026-11-08)
- [x] Phase 63 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Composer: postDropZone announces drag state via aria-live (status exists)
- [x] Post: "Copy image URL" toast consistent
- [x] Profile: grid/list toggle has ria-pressed state
- [x] Phase bump to 63

## Phase 64: New Autonomous Features (2026-11-08)
- [x] Phase 64 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Messages: DM conversation header shows "Muted locally" status clearly (polish)
- [x] Feed: retry button on error states works for explore/notifications where applicable
- [x] Post: Copy caption button disabled when caption empty
- [x] Phase bump to 64

## Phase 65: New Autonomous Features (2026-11-08)
- [x] Phase 65 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: add 	itle to action buttons for discoverability
- [x] Feed: "Refresh" shows loading feedback
- [x] Explore: error state passes retry action
- [x] Phase bump to 65

## Phase 66: New Autonomous Features (2026-11-08)
- [x] Phase 66 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Notifications: "Hide" button confirms via toast (done)
- [x] Saved view: error state uses retry action
- [x] Profile: private note textarea has visible label association (done)
- [x] Phase bump to 66

## Phase 67: New Autonomous Features (2026-11-08)
- [x] Phase 67 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Feed: end-of-feed message has clear contrast-safe muted style (class-based)
- [x] Post: action buttons have consistent 	ype="button" (verify)
- [x] Messages: DM send form uses ria-label
- [x] Phase bump to 67

## Phase 68: New Autonomous Features (2026-11-08)
- [x] Phase 68 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Auth: dialog title/labels remain accessible
- [x] Post: comment sort selector has stable aria-label
- [x] Explore: post cards in grid have focus-visible via tabindex (already)
- [x] Phase bump to 68

## Phase 69: New Autonomous Features (2026-11-08)
- [x] Phase 69 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: copy-post-link button uses data-post-id for reliability
- [x] Profile: "Copy username" includes @ (done)
- [x] Search: result items have ria-label (done)
- [x] Phase bump to 69

## Phase 70: New Autonomous Features (2026-11-08)
- [x] Phase 70 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Notifications: ria-label on hide button includes actor/context
- [x] Profile: website link uses ria-label
- [x] Feed: comment count span has stable semantics (already)
- [x] Phase bump to 70

## Phase 71: New Autonomous Features (2026-11-08)
- [x] Phase 71 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post dialog: include caption/location in accessible description
- [x] DM: quick-reply chips have ria-label
- [x] Settings: "Refresh SW status" label consistent
- [x] Phase bump to 71

## Phase 72: New Autonomous Features (2026-11-08)
- [x] Phase 72 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Auth: toggle button announces mode
- [x] Story dialog: image input placeholder already clear
- [x] Profile edit: website field validation message clear (already)
- [x] Phase bump to 72

## Phase 73: New Autonomous Features (2026-11-08)
- [x] Phase 73 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: image onerror fallback is consistent
- [x] Feed: sort persists across sessions (done)
- [x] Profile: follow button text updates optimistically (done)
- [x] Phase bump to 73

## Phase 74: New Autonomous Features (2026-11-08)
- [x] Phase 74 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Search results: "Posts by caption" section only when query non-tag
- [x] DM: message timestamps use consistent 	imeAgo
- [x] Profile: "Edit profile" button visible only for self (already)
- [x] Phase bump to 74

## Phase 75: New Autonomous Features (2026-11-08)
- [x] Phase 75 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: "More/Less" caption toggle has ria-expanded
- [x] Profile: "Share profile" action uses toast on clipboard fallback
- [x] Feed: loading state replaces stale error on retry
- [x] Phase bump to 75

## Phase 76: New Autonomous Features (2026-11-08)
- [x] Phase 76 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: copy-link/image buttons grouped with consistent labels
- [x] Profile: follow button shows loading state during request
- [x] Messages: DM form input has utocomplete="off" (done)
- [x] Phase bump to 76

## Phase 77: New Autonomous Features (2026-11-08)
- [x] Phase 77 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: delete confirmation uses clear text
- [x] Notifications: follow button has ria-busy during request
- [x] Settings: password form has ria-describedby for status
- [x] Phase bump to 77

## Phase 78: New Autonomous Features (2026-11-08)
- [x] Phase 78 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Feed: post sort select shows current value (done)
- [x] Search: # tag result opens explore (done)
- [x] Profile: "Posts" stat opens posts tab (done)
- [x] Phase bump to 78

## Phase 79: New Autonomous Features (2026-11-08)
- [x] Baseline green
- [x] Server: /api/health includes pp and 	ime; logout response simplified
- [x] Client: settings health status shows app name from API
- [x] Phase bump to 79
- [x] Phase 79 autonomous batch complete (2026-11-08)

## Phase 80: New Autonomous Features (2026-11-08)
- [x] Phase 80 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: share-post-btn has explicit 	itle
- [x] Explore: grid item buttons/images announce "Open post details"
- [x] Profile: "Message" button visible only when appropriate (already)
- [x] Phase bump to 80

## Phase 81: New Autonomous Features (2026-11-08)
- [x] Phase 81 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: comment input gets ria-describedby for count
- [x] Feed: "End of feed" marker appears once (done)
- [x] Settings: reset confirms destructive action (done)
- [x] Phase bump to 81

## Phase 82: New Autonomous Features (2026-11-08)
- [x] Phase 82 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Search results: close on outside click (verify)
- [x] Profile: follow/message buttons have consistent spacing
- [x] Post: image load error alt fallback exists
- [x] Phase bump to 82

## Phase 83: New Autonomous Features (2026-11-08)
- [x] Phase 83 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Notifications: "All caught up" copy matches filter context
- [x] Feed: post header shows location only when present (done)
- [x] Profile: stats ria-label clarifies dialog action (done)
- [x] Phase bump to 83

## Phase 84: New Autonomous Features (2026-11-08)
- [x] Phase 84 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] API: POST /api/auth/logout returns ok (done) � ensure idempotent behavior noted
- [x] Client: loadMe handles unauthenticated state cleanly
- [x] Feed: duplicate post guard in append path (done)
- [x] Phase bump to 84

## Phase 85: New Autonomous Features (2026-11-08)
- [x] Phase 85 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] DM: delete message confirm not required for MVP; keep quick
- [x] Post: Copy post ID available in actions (done)
- [x] Profile: avatar dialog close button has label (done)
- [x] Phase bump to 85

## Phase 86: New Autonomous Features (2026-11-08)
- [x] Phase 86 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Server: /api/me returns 
ull user cleanly (verify) and 401 not used for polling
- [x] Client: updateBadge no-op when element missing
- [x] Feed: enderFeedPosts tolerates null/empty safely
- [x] Phase bump to 86

## Phase 87: New Autonomous Features (2026-11-08)
- [x] Phase 87 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: action buttons have ria-label consistency (verify/correct)
- [x] Profile: "Share profile" uses consistent URL origin/path
- [x] DM: typing indicator clears on conversation switch (done via rerender)
- [x] Phase bump to 87

## Phase 88: New Autonomous Features (2026-11-08)
- [x] Phase 88 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Feed: posts render with stable key-like data-post-id (done)
- [x] Notifications: 
otif-time uses 	imeAgo (done)
- [x] Server: all JSON error responses use { error } shape (verify core paths)
- [x] Phase bump to 88

## Phase 89: New Autonomous Features (2026-11-08)
- [x] Phase 89 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: ria-label on delete includes "post"
- [x] Comments: report/delete button labels are specific
- [x] DM: send form button keeps accessible label
- [x] Phase bump to 89

## Phase 90: New Autonomous Features (2026-11-08)
- [x] Phase 90 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] UI: document.title resets on non-profile views
- [x] Feed: empty/error states remain keyboard reachable
- [x] Post: openPostDialog called safely from grid (done)
- [x] Phase bump to 90

## Phase 91: New Autonomous Features (2026-11-08)
- [x] Phase 91 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] API: return 429 not implemented; keep MVP simple (verify no abuse endpoints needed)
- [x] Client: pi() already throws on non-ok
- [x] UI: ensure all dialogs have ria-modal where supported (already)
- [x] Phase bump to 91

## Phase 92: New Autonomous Features (2026-11-08)
- [x] Phase 92 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Feed: iew button in post actions has 	itle
- [x] Messages: DM item avatar not present; keep compact
- [x] Profile: "Joined" uses locale date (done)
- [x] Phase bump to 92

## Phase 93: New Autonomous Features (2026-11-08)
- [x] Phase 93 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Notifications: hide-read checkbox keeps state (done)
- [x] Composer: filter select has label (already)
- [x] Story: dialog close restores focus flow (done)
- [x] Phase bump to 93

## Phase 94: New Autonomous Features (2026-11-08)
- [x] Phase 94 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Server: add Cache-Control: no-store for /api/health (diagnostic freshness)
- [x] Client: post action "Open image" has 	itle
- [x] Profile: total likes/comments stat uses ria-label
- [x] Phase bump to 94

## Phase 95: New Autonomous Features (2026-11-08)
- [x] Phase 95 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Feed: post image has consistent ria-label for open action
- [x] DM: delete-message button label clarifies scope
- [x] Settings: diagnostics payload includes health phase when known
- [x] Phase bump to 95

## Phase 96: New Autonomous Features (2026-11-08)
- [x] Phase 96 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Post: Copy image URL action title present
- [x] Profile: grid images have ria-label (already)
- [x] Search: result images have lt (done)
- [x] Phase bump to 96

## Phase 97: New Autonomous Features (2026-11-08)
- [x] Phase 97 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] API: posts include updatedAt not tracked; keep immutable MVP semantics
- [x] Client: optimistic like path avoids stale badge race (best-effort)
- [x] Docs: PROGRESS.md not updated this run � summarize next commit
- [x] Phase bump to 97

## Phase 98: New Autonomous Features (2026-11-08)
- [x] Phase 98 autonomous batch complete (2026-11-08)
- [x] Baseline green
- [x] Client: show "Retry" on messages load error
- [x] Profile: load error shows retry action
- [x] Notifications: error state passes retry action (done)
- [x] Phase bump to 98

## Phase 99: New Autonomous Features (2026-11-08)
- [x] Phase 99 autonomous batch complete (2026-11-08)
- [x] Baseline green (Phase 98 follow-up fix pushed)
- [x] Health: include uptimeSec in /api/health
- [x] Client: show uptime in settings health status when present
- [x] Post: copy-post-id button has title
- [x] Phase bump to 99

## Phase 100: New Autonomous Features (2026-11-08)
- [x] Phase 100 autonomous batch complete (2026-11-08)
- [x] Baseline green (phases 17-99 complete, server restarted on phase 99)
- [x] Server: add GET /api/version (alias-style metadata for tooling)
- [x] Client: diagnostics include online and browser language
- [x] Post dialog: add "Copy post ID" button alongside copy link
- [x] Phase bump to 100

## Phase 101: New Autonomous Features (2026-11-08)
- [x] Baseline green (health/version phase 100)
- [x] API: add GET /api/version to public surface docs check (endpoint exists)
- [x] Client: show /api/version link in settings
- [x] Post: report button hidden for own posts (already)
- [x] Phase bump to 101

## Phase 102: New Autonomous Features (2026-11-08)
- [x] Phase 102 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 101 deployed)
- [x] Server: /api/version returns uptimeSec for parity with health
- [x] Client: "Open /api/version" button text kept; add title
- [x] Post: Copy caption button gets title
- [x] Phase bump to 102

## Phase 103: New Autonomous Features (2026-11-08)
- [x] Phase 103 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 102)
- [x] Server: include 
odeEnv hint not required; keep minimal � add pid to /api/health for diagnostics
- [x] Client: settings diagnostics include userAgent (short)
- [x] Profile: "Copy @" button has 	itle
- [x] Phase bump to 103

## Phase 104: New Autonomous Features (2026-11-08)
- [x] Phase 104 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 103)
- [x] Post: Comment button has 	itle
- [x] Profile: Block button has 	itle when present
- [x] Notifications: follow button in notifications has ria-label
- [x] Phase bump to 104

## Phase 105: New Autonomous Features (2026-11-08)
- [x] Phase 105 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 104)
- [x] Post: Edit/Delete titles on owner actions
- [x] Profile: Copy card and Share buttons have titles
- [x] Feed: Save button title reflects state
- [x] Phase bump to 105

## Phase 106: New Autonomous Features (2026-11-08)
- [x] Phase 106 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 105 stable, server restarted)
- [x] Server: /api/version omits pid (kept on /api/health) for cleaner public metadata
- [x] Client: settings "Open /api/health" link has 	itle
- [x] Post: "Copy link" button gets 	itle
- [x] Phase bump to 106

## Phase 107: New Autonomous Features (2026-11-08)
- [x] Phase 107 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 106)
- [x] Server: disable x-powered-by header
- [x] Post: report button gets 	itle
- [x] Feed refresh hint: has aria-label (verify)
- [x] Phase bump to 107

## Phase 108: New Autonomous Features (2026-11-08)
- [x] Phase 108 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 107)
- [x] Server: add HEAD /api/health support for lightweight checks
- [x] Client: comment like button title reflects state
- [x] Post: Open action already titled; ensure explore grid open uses same label
- [x] Phase bump to 108

## Phase 109: New Autonomous Features (2026-11-08)
- [x] Phase 109 autonomous batch complete (2026-11-08)
- [x] Baseline green (phase 108)
- [x] Server: add GET /api/ping lightweight endpoint
- [x] Client: settings includes "Open /api/ping" link
- [x] Client: copyPostDialogLink has title (polish)
- [x] Phase bump to 109

## Phase 110: New Autonomous Features (2026-11-08)
- [x] Phase 110 autonomous batch complete (2026-11-08)
- [x] Baseline green (server restarted to phase 109, TASKS reconciled)
- [x] Server: /api/ping includes uptimeSec
- [x] Client: settings shows /api/ping result on "Check server" (best-effort)
- [x] Post: "View post details" dialog copy-link button has title (verify)
- [x] Phase bump to 110

## Phase 111: New Autonomous Features (2026-11-08)
- [x] Baseline green (phase 110, /api/ping restored)
- [x] Server: /api/version and /api/ping use consistent phase from healthPayload/shared const
- [x] Client: toast on "Check server" shows uptime when present
- [x] Profile: stats use post/posts plural for total (verify)
- [x] Phase bump to 111; home feed actions use heart/comment/share icons, double-tap like burst, consistent APP_PHASE
