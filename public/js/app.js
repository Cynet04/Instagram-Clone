const state = { me: null, view: "feed", authMode: "login", feed: { offset: 0, limit: 5, hasMore: true, loading: false }, dm: { userId: null }, stories: [], storyIndex: 0 };

const el = (id) => document.getElementById(id);
const views = ["feed", "explore", "notifications", "saved", "messages", "profile", "search", "settings"];
let feedObserver;

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, credentials: "same-origin", ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

let toastTimer;
function toast(message, kind = "") {
  const node = el("toast"); if (!node) return;
  node.textContent = message || "";
  node.className = `toast ${kind}`.trim();
  if (!message) { node.classList.add("hidden"); return; }
  node.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.add("hidden"), 2400);
}

function loadingState(message = "Loading...") {
  return `<div class="card state-card" role="status" aria-live="polite" aria-busy="true"><div class="state-spinner" aria-hidden="true"></div><div>${esc(message)}</div></div>`;
}
function emptyState(title, detail = "") {
  return `<div class="card state-card"><div class="state-title">${esc(title)}</div>${detail ? `<div class="state-detail">${esc(detail)}</div>` : ""}</div>`;
}
function errorState(message, retry = "") {
  return `<div class="card state-card state-error"><div class="state-title">Something went wrong</div><div class="state-detail">${esc(message)}</div>${retry ? `<button type="button" class="mini-btn" data-retry-action="${esc(retry)}" style="margin-top:10px">Try again</button>` : ""}</div>`;
}

function timeAgo(ts) {
  const s = Math.max(0, Math.floor((Date.now() - (Number(ts) || 0)) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7); if (w < 5) return `${w}w`;
  return new Date(Number(ts) || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" });
}
function avatar(user) {
  const src = user?.avatar || "";
  if (src) return esc(src);
  const name = encodeURIComponent(user?.username || "user");
  return `https://placehold.co/192x192/f5f5f5/737373?text=${name}`;
}
function postHtml(p) {
  const filter = esc(p.filter || "none");
  const mine = state.me && p.user?.id === state.me.id;
  const fallback = "https://placehold.co/1080x1080/f5f5f5/737373?text=Image+unavailable";
  return `
    <article class="card post" data-id="${p.id}">
      <div class="post-head">
        <img class="avatar profile-link" src="${avatar(p.user)}" alt="${esc(p.user?.username || "user")} avatar" data-profile="${esc(p.user?.username || "")}" onerror="this.onerror=null;this.src='${fallback}'" />
        <span class="post-user profile-link" data-profile="${esc(p.user?.username || "")}">${esc(p.user?.username || "user")}</span>
        <span class="post-time">${timeAgo(p.createdAt)}</span>
        ${mine ? `<button class="delete-post-btn" title="Delete post" aria-label="Delete post">Delete</button>` : ""}
      </div>
      <img class="post-image filter-${filter}" src="${esc(p.image)}" alt="Post by ${esc(p.user?.username || "user")}${p.caption ? `: ${esc(String(p.caption).slice(0, 80))}` : ""}" loading="lazy" decoding="async" title="Open post details" tabindex="0" role="button" aria-label="Open post details by ${esc(p.user?.username || "user")}" onerror="this.onerror=null;this.src='${fallback}'" />
      <div class="post-actions">
        <button class="like-btn ${p.likedByMe ? "liked" : ""}" aria-label="${p.likedByMe ? "Unlike" : "Like"}" aria-pressed="${p.likedByMe ? "true" : "false"}">${p.likedByMe ? "Liked" : "Like"}</button>
        <button class="comment-focus-btn" type="button" aria-label="Comment">Comment</button>
        <button class="copy-caption-btn" type="button" aria-label="Copy caption">Copy caption</button>
        <button class="copy-image-btn" type="button" aria-label="Copy image link">Copy image</button>
        <button class="open-image-btn" type="button" aria-label="Open image in new tab">Open image</button>
        <button class="share-post-btn" type="button" aria-label="Copy post link" title="Copy post link">Share</button>
        ${!mine ? `<button class="report-post-btn" type="button" aria-label="Report post" title="Report post">Report</button>` : ""}
        <button class="save-btn ${p.savedByMe ? "saved" : ""}" aria-label="${p.savedByMe ? "Remove from saved" : "Save"}" aria-pressed="${p.savedByMe ? "true" : "false"}" style="margin-left:auto">${p.savedByMe ? "Saved" : "Save"}</button>
      </div>
      <div class="post-likes">${p.likesCount} likes</div>
      <div class="post-caption"><strong class="profile-link" data-profile="${esc(p.user?.username || "")}">${esc(p.user?.username || "")}</strong> <span class="caption-text">${formatCaption(p.caption || "")}</span></div>
      <div class="comments">${(p.comments || []).map((c) => {
        const canDelete = state.me && (c.user?.id === state.me.id || mine);
        return `
        <div class="comment" data-comment-id="${c.id}" data-comment-user="${c.user?.id || ""}">
          <span><strong class="profile-link" data-profile="${esc(c.user?.username || "")}">${esc(c.user?.username || "user")}</strong> ${esc(c.text)}</span>
          <span class="comment-actions">
            <button class="comment-like-btn ${c.likedByMe ? "liked" : ""}" type="button" aria-label="${c.likedByMe ? "Unlike comment" : "Like comment"}" aria-pressed="${c.likedByMe ? "true" : "false"}">Like ${c.likesCount || 0}</button>
            ${canDelete ? `<button class="comment-delete-btn" type="button" aria-label="Delete comment">Delete</button>` : ""}
          </span>
        </div>`; }).join("")}</div>
      <form class="comment-form">
        <input name="text" placeholder="Add a comment..." maxlength="500" aria-label="Add a comment" ${state.me ? "" : "disabled"} />
        <button ${state.me ? "" : "disabled"}>Post</button>
      </form>
    </article>`;
}

async function loadStories() {
  const { stories } = await api("/api/stories");
  state.stories = stories || [];
  const add = state.me ? `<button class="story story-add" type="button" id="addStoryBtn" aria-label="Add to your story"><span class="story-plus">+</span><span>Your story</span></button>` : "";
  el("stories").innerHTML = add + state.stories.map((s, i) => `
    <button class="story" type="button" data-story-index="${i}" aria-label="View story by ${esc(s.user?.username || "user")}"><img src="${avatar(s.user)}" alt="" /><span>${esc(s.user?.username || "story")}</span></button>`).join("") || (add ? "" : emptyState("No stories yet", "Stories from people you follow will appear here.").replace('<div class="card state-card">','<div class="state-card" style="border:0;min-width:180px;padding:10px">'));
  el("stories").querySelectorAll("[data-story-index]").forEach((b) => b.onclick = () => openStory(Number(b.dataset.storyIndex)));
  el("addStoryBtn")?.addEventListener("click", () => el("storyCreator").classList.toggle("hidden"));
}

function renderStory() {
  const s = state.stories[state.storyIndex];
  if (!s) return;
  el("storyImage").src = s.image;
  el("storyImage").alt = `Story by ${s.user?.username || "user"}`;
  el("storyMeta").textContent = `${s.user?.username || "story"} � ${timeAgo(s.createdAt)}`;
  const prev = el("storyPrev"); const next = el("storyNext");
  if (prev) prev.disabled = state.storyIndex <= 0;
  if (next) next.disabled = false;
}

function openStory(index = 0) {
  if (!state.stories.length) return;
  state.storyIndex = Math.max(0, Math.min(index, state.stories.length - 1));
  renderStory();
  showDialog(el("storyDialog"));
  (el("storyNext") || el("storyClose"))?.focus?.();
}

el("storyPrev")?.addEventListener("click", () => { if (state.storyIndex > 0) { state.storyIndex--; renderStory(); } });
el("storyNext")?.addEventListener("click", () => { if (state.storyIndex < state.stories.length - 1) { state.storyIndex++; renderStory(); } else closeDialog(el("storyDialog")); });
el("storyClose")?.addEventListener("click", () => closeDialog(el("storyDialog")));
el("storyDialog")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeDialog(e.currentTarget); });

async function loadFeed(reset = true) {
  if (state.feed.loading) return;
  if (reset) {
    state.feed.offset = 0;
    state.feed.hasMore = true;
    el("view-feed").innerHTML = loadingState("Loading feed...");
  }
  if (!state.feed.hasMore) return;
  state.feed.loading = true;
  const statusId = "feedStatus";
  el(statusId)?.remove();
  if (!reset) el("view-feed").insertAdjacentHTML("beforeend", `<div id="${statusId}" class="feed-status" role="status" aria-live="polite">Loading more posts...</div>`);
  try {
    const [feed, search] = await Promise.all([
      api(`/api/feed?offset=${state.feed.offset}&limit=${state.feed.limit}`),
      state.feed.offset === 0 ? api("/api/search?q=a") : Promise.resolve({ users: [] })
    ]);
    el(statusId)?.remove();
    if (reset) el("view-feed").innerHTML = "";
    if (state.feed.offset === 0) await renderSuggestions(search.users || []);
    const html = (feed.posts || []).map(postHtml).join("");
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    bindPostActions(wrap);
    while (wrap.firstChild) el("view-feed").appendChild(wrap.firstChild);
    state.feed.offset += (feed.posts || []).length;
    state.feed.hasMore = !!feed.hasMore;
    if (!el("view-feed").children.length) el("view-feed").innerHTML = emptyState("No posts yet", "When people share photos, they'll appear here.");
    el("feedSentinel").classList.toggle("hidden", state.view !== "feed");
    if (!state.feed.hasMore && el("view-feed").children.length) el("view-feed").insertAdjacentHTML("beforeend", `<div class="feed-status" role="status">You're all caught up.</div>`);
  } catch (e) {
    el(statusId)?.remove();
    if (!el("view-feed").children.length || reset) el("view-feed").innerHTML = errorState(e.message);
    else el("view-feed").insertAdjacentHTML("beforeend", `<div class="feed-status" role="alert">${esc(e.message)}</div>`);
  } finally {
    state.feed.loading = false;
  }
}

function setupFeedObserver() {
  const sentinel = el("feedSentinel");
  if (!sentinel) return;
  feedObserver?.disconnect();
  feedObserver = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && state.view === "feed") loadFeed(false);
  }, { rootMargin: "300px" });
  feedObserver.observe(sentinel);
}

async function loadExplore(q = "") {
  const query = q.trim();
  el("view-explore").innerHTML = loadingState("Loading explore...");
  try {
    const data = query ? await api(`/api/search?q=${encodeURIComponent(query)}`) : await api(`/api/feed?offset=0&limit=30`);
    const posts = data.posts || [];
    el("view-explore").innerHTML = `<div class="card" style="padding:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">
        <h3 style="margin:0">Explore ${query ? `: ${esc(query)}` : ""}</h3>
        ${query ? `<button id="clearExplore" class="mini-btn secondary" type="button" aria-label="Clear explore search">Clear</button>` : ""}
      </div>
      <div class="explore-grid">${posts.map((p) => `<img class="filter-${esc(p.filter || "none")}" src="${esc(p.image)}" alt="Explore post by ${esc(p.user?.username || "user")}" loading="lazy" decoding="async" data-post-id="${p.id}" title="Open post by ${esc(p.user?.username || "")}" tabindex="0" role="button" aria-label="Open post by ${esc(p.user?.username || "user")}" onerror="this.style.opacity='0.35'" />`).join("") || ""}</div>
      ${posts.length ? "" : emptyState("No posts found", query ? "Try a different search." : "Posts will appear here.")}
    </div>`;
    bindPostOpen(el("view-explore"));
    el("clearExplore")?.addEventListener("click", () => { el("searchInput").value = ""; loadExplore(""); });
  } catch (e) { el("view-explore").innerHTML = errorState(e.message, "explore"); }
}

async function loadSaved() {
  if (!state.me) { el("view-saved").innerHTML = emptyState("Log in to view saved posts", "Your saved posts will appear here."); return; }
  el("view-saved").innerHTML = loadingState("Loading saved posts...");
  try {
    const { posts } = await api("/api/saved");
    el("view-saved").innerHTML = `<div class="card" style="padding:14px"><h3 style="margin:0">Saved</h3></div>` + (posts.map(postHtml).join("") || emptyState("No saved posts yet", "Save posts from your feed to see them here."));
    bindPostActions(el("view-saved"));
  } catch (e) { el("view-saved").innerHTML = errorState(e.message, "saved"); }
}

async function loadNotifications() {
  if (!state.me) { el("view-notifications").innerHTML = emptyState("Log in to view notifications", "Likes, comments, and follows will appear here."); return; }
  el("view-notifications").innerHTML = loadingState("Loading notifications...");
  try {
    const { notifications, unread } = await api("/api/notifications");
    updateBadge(unread);
    el("view-notifications").innerHTML = `<div class="card"><div style="padding:14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Notifications</h3><button id="markReadBtn" type="button" aria-label="Mark all notifications as read" style="border:0;background:none;color:var(--blue);font-weight:600">Mark read</button></div>` +
      (notifications.map((n) => {
        const actor = esc(n.actor?.username || "Someone");
        const msg = n.type === "like" ? "liked your post" : n.type === "comment" ? `commented: ${esc(n.text || "")}` : n.type === "comment_like" ? "liked your comment" : n.type === "follow" ? "started following you" : "interacted with you";
        const postId = n.post?.id || "";
        const profile = n.actor?.username || "";
        const followBtn = n.type === "follow" && state.me && profile && state.me.username !== profile
          ? `<button type="button" class="mini-btn ${n.actor?.isFollowing ? "secondary" : ""}" data-follow-user="${esc(profile)}" style="margin-left:auto;padding:4px 8px;font-size:12px" aria-label="${n.actor?.isFollowing ? "Unfollow" : "Follow"} ${esc(profile)}">${n.actor?.isFollowing ? "Following" : "Follow"}</button>`
          : "";
        return `<div class="notif notif-link ${n.read ? "" : "unread"}" data-notif-id="${esc(n.id || "")}" data-notif-post="${esc(postId)}" data-notif-profile="${esc(profile)}" data-notif-type="${esc(n.type || "")}" tabindex="0" role="button" aria-label="${esc(actor)} ${esc(msg.replace(/<[^>]+>/g, ""))}"><img class="avatar" src="${avatar(n.actor)}" alt="" style="width:34px;height:34px" /><span class="notif-text" style="flex:1"><strong>${actor}</strong> ${msg}<span class="notif-time">${timeAgo(n.createdAt)}</span></span>${followBtn}</div>`;
      }).join("") || `<div style="padding:16px">${emptyState("No notifications yet", "When people interact with you, you'll see it here.").replace('<div class="card state-card">','<div class="state-card" style="border:0">')}</div>`) + `</div>`;
    el("markReadBtn")?.addEventListener("click", async () => {
      try {
        const res = await api("/api/notifications/read", { method: "POST", body: "{}" });
        updateBadge(res.unread ?? 0);
        toast("Notifications marked as read.");
        loadNotifications();
      } catch (e) { toast(e.message, "error"); }
    });
    el("view-notifications").querySelectorAll("button[data-follow-user]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!state.me) return openAuth();
        const prev = btn.textContent;
        btn.disabled = true;
        try {
          const res = await api(`/api/users/${encodeURIComponent(btn.dataset.followUser)}/follow`, { method: "POST", body: "{}" });
          btn.textContent = res.following ? "Following" : "Follow";
          btn.classList.toggle("secondary", !!res.following);
          btn.setAttribute("aria-label", `${res.following ? "Unfollow" : "Follow"} ${btn.dataset.followUser}`);
          toast(res.following ? "Following user." : "Unfollowed.");
        } catch (err) { btn.textContent = prev; btn.setAttribute("aria-label", `${prev === "Following" ? "Unfollow" : "Follow"} ${btn.dataset.followUser}`); toast(err.message, "error"); }
        finally { btn.disabled = false; }
      });
    });
    el("view-notifications").querySelectorAll("[data-notif-post],[data-notif-profile],[data-notif-id]").forEach((node) => {
      if (node.tagName === "BUTTON" && node.dataset.followUser) return;
      const openNotif = async (e) => {
        if (e.target.closest("button[data-follow-user]")) return;
        const notifId = node.dataset.notifId;
        if (node.classList.contains("unread") && notifId) {
          node.classList.remove("unread");
          updateBadge(Math.max(0, Number(el("notifBadge")?.textContent || 0) - 1));
          api("/api/notifications/read", { method: "POST", body: JSON.stringify({ ids: [notifId] }) }).then((r) => updateBadge(r.unread ?? Number(el("notifBadge")?.textContent || 0))).catch(() => {});
        }
        const postId = node.dataset.postId || node.dataset.notifPost;
        const profile = node.dataset.profile || node.dataset.notifProfile;
        try {
          if (postId) {
            const { post } = await api(`/api/posts/${postId}`);
            el("postDialogBody").innerHTML = postHtml(post);
            bindPostActions(el("postDialogBody"));
            showDialog(el("postDialog"));
          } else if (profile) {
            loadProfile(profile);
          }
        } catch (e2) { toast(e2.message, "error"); }
      };
      node.addEventListener("click", openNotif);
      node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNotif(e); } });
    });
  } catch (e) { el("view-notifications").innerHTML = errorState(e.message, "notifications"); }
}

function updateBadge(n = 0) {
  const b = el("notifBadge");
  if (!b) return;
  b.textContent = String(n);
  b.classList.toggle("hidden", !state.me || n <= 0);
  setDocumentTitle(document.title.replace(/^\(\d+\)\s*/, "").replace(/\s�\sInstagram Clone$/, "").replace(/^Instagram Clone$/, "") || "");
}

async function refreshNotificationsBadge() {
  if (!state.me) return updateBadge(0);
  try { const { unread } = await api("/api/notifications"); updateBadge(unread); } catch { updateBadge(0); }
}

async function loadProfile(username, tab = "posts", opts = {}) {
  if (!username) {
    if (location.hash.startsWith("#/profile/") && !opts.fromRoute) history.replaceState(null, "", "#/profile");
    el("view-profile").innerHTML = emptyState("Log in to view your profile", "Your profile and posts will appear here.");
    setDocumentTitle("Profile");
    setView("profile", { skipLoad: true, fromHash: opts.fromRoute, skipTitle: true });
    return;
  }
  const hash = tab === "saved" ? `#/profile/${encodeURIComponent(username)}/saved` : `#/profile/${encodeURIComponent(username)}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
  setDocumentTitle(tab === "saved" ? `@${username} � Saved` : `@${username}`);
  el("view-profile").innerHTML = loadingState("Loading profile...");
  setView("profile", { skipLoad: true, fromHash: opts.fromRoute, username, skipTitle: true });
  try {
    const { user, posts, followers = 0, following = 0, followersList = [], followingList = [], isFollowing = false, isMe = false } = await api(`/api/users/${encodeURIComponent(username)}`);
    let savedPosts = [];
    if (isMe && tab === "saved" && state.me) {
      try { savedPosts = (await api("/api/saved")).posts || []; } catch {}
    }
    const gridPosts = tab === "saved" ? savedPosts : posts;
    el("view-profile").innerHTML = `
      <div class="card">
        <div class="profile-head">
          <img class="avatar" src="${avatar(user)}" alt="${esc(user.username)} avatar" onerror="this.onerror=null;this.src='https://placehold.co/192x192/f5f5f5/737373?text=User'" />
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <h2 style="margin:0">${esc(user.username)}</h2>
              ${state.me && !isMe ? `<button id="followBtn" class="mini-btn ${isFollowing ? "secondary" : ""}" aria-label="${isFollowing ? "Unfollow" : "Follow"} ${esc(user.username)}">${isFollowing ? "Following" : "Follow"}</button><button id="messageBtn" class="mini-btn secondary" aria-label="Message ${esc(user.username)}">Message</button>` : ""}
              ${isMe ? `<button id="editProfileBtn" class="mini-btn secondary" aria-label="Edit your profile">Edit profile</button>` : ""}
              <button id="shareProfileBtn" class="mini-btn secondary" title="Copy profile link" aria-label="Share profile for ${esc(user.username)}">Share</button>
            </div>
            <div style="display:flex;gap:16px;margin:8px 0"><span><strong>${posts.length}</strong> posts</span><button type="button" class="link-btn" id="showFollowersBtn" style="border:0;background:none;padding:0;font:inherit;cursor:pointer"><strong id="followersCount">${followers}</strong> followers</button><button type="button" class="link-btn" id="showFollowingBtn" style="border:0;background:none;padding:0;font:inherit;cursor:pointer"><strong>${following}</strong> following</button></div>
            <div><strong>${esc(user.name || "")}</strong></div>
            <div>${esc(user.bio || "")}</div>
          </div>
        </div>
        ${isMe ? `<div class="profile-tabs" role="tablist" aria-label="Profile sections"><button type="button" role="tab" aria-selected="${tab === "posts" ? "true" : "false"}" data-ptab="posts" class="${tab === "posts" ? "active" : ""}">Posts</button><button type="button" role="tab" aria-selected="${tab === "saved" ? "true" : "false"}" data-ptab="saved" class="${tab === "saved" ? "active" : ""}">Saved</button></div>` : ""}
      </div>
      <div class="card" style="padding:4px"><div class="grid">${gridPosts.map((p) => `<img class="filter-${esc(p.filter || "none")}" src="${esc(p.image)}" alt="Post by ${esc(user.username)}" loading="lazy" decoding="async" data-post-id="${p.id}" title="Open post details" tabindex="0" role="button" aria-label="Open post details" onerror="this.style.opacity='0.35'" />`).join("") || `<div style="grid-column:1/-1;padding:8px">${emptyState(tab === "saved" ? "No saved posts" : "No posts yet", tab === "saved" ? "Posts you save will appear here." : isMe ? "Share your first photo to get started." : "This user hasn't posted yet.").replace('<div class="card state-card">','<div class="state-card" style="border:0;min-height:180px">')}</div>`}</div></div>`;
    bindPostOpen(el("view-profile"));
    const openList = (title, users = []) => {
      el("listDialogTitle").textContent = title;
      el("listDialogBody").innerHTML = users.length ? users.map((u) => `<div class="notif" style="align-items:center"><img class="avatar" src="${avatar(u)}" alt="" style="width:34px;height:34px" /><div style="flex:1"><strong>@${esc(u.username)}</strong><div style="color:var(--muted);font-size:13px">${esc(u.name || "")}</div></div><button type="button" class="mini-btn secondary" data-profile="${esc(u.username)}">View</button></div>`).join("") : `<div style="padding:8px 0">${emptyState("No users", "Nothing to show yet.").replace('<div class="card state-card">','<div class="state-card" style="border:0;min-height:0;padding:8px 0">')}</div>`;
      bindProfileLinks(el("listDialogBody"));
      el("listDialogBody").querySelectorAll("[data-profile]").forEach((b) => b.addEventListener("click", () => closeDialog(el("listDialog"))));
      showDialog(el("listDialog"));
      el("listDialogClose")?.focus?.();
    };
    el("showFollowersBtn")?.addEventListener("click", () => openList("Followers", followersList));
    el("showFollowingBtn")?.addEventListener("click", () => openList("Following", followingList));
    el("followBtn")?.addEventListener("click", async () => {
      const btn = el("followBtn");
      const count = el("followersCount");
      const prevFollowing = btn.classList.contains("secondary");
      const prevCount = Number((count?.textContent || "0").match(/\d+/)?.[0] || 0);
      const nextFollowing = !prevFollowing;
      btn.disabled = true;
      btn.classList.toggle("secondary", nextFollowing);
      btn.textContent = nextFollowing ? "Following" : "Follow";
      if (count) count.textContent = String(Math.max(0, prevCount + (nextFollowing ? 1 : -1)));
      try {
        const res = await api(`/api/users/${encodeURIComponent(user.username)}/follow`, { method: "POST", body: "{}" });
        btn.classList.toggle("secondary", !!res.following);
        btn.textContent = res.following ? "Following" : "Follow";
        btn.setAttribute("aria-label", `${res.following ? "Unfollow" : "Follow"} ${user.username}`);
        if (count && typeof res.followers === "number") count.textContent = String(res.followers);
        toast(res.following ? `Following @${user.username}.` : `Unfollowed @${user.username}.`);
        refreshNotificationsBadge();
      } catch (e) {
        btn.classList.toggle("secondary", prevFollowing);
        btn.textContent = prevFollowing ? "Following" : "Follow";
        btn.setAttribute("aria-label", `${prevFollowing ? "Unfollow" : "Follow"} ${user.username}`);
        if (count) count.textContent = String(prevCount);
        toast(e.message, "error");
      } finally { btn.disabled = false; }
    });
    el("messageBtn")?.addEventListener("click", () => openDmWith(user.id));
    el("editProfileBtn")?.addEventListener("click", () => {
      const f = el("profileEditForm");
      f.name.value = state.me?.name || "";
      f.bio.value = state.me?.bio || "";
      f.avatar.value = state.me?.avatar || "";
      el("profileEditError").textContent = "";
      showDialog(el("profileEditDialog"));
    });
  el("shareProfileBtn")?.addEventListener("click", async () => {
    const btn = el("shareProfileBtn");
    const url = `${location.origin}${location.pathname}#/profile/${encodeURIComponent(user.username)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `@${user.username} on Instagram Clone`, text: `Check out @${user.username}`, url });
        toast("Profile shared.");
        return;
      }
      await navigator.clipboard?.writeText(url);
      toast("Profile link copied.");
      if (btn) { btn.textContent = "Copied"; setTimeout(() => { if (btn) btn.textContent = "Share"; }, 1500); }
    } catch (e) {
      if (e?.name === "AbortError") return;
      try { await navigator.clipboard?.writeText(url); toast("Profile link copied."); }
      catch { prompt("Copy profile link:", url); toast("Copy the profile link from the prompt."); }
    }
  });
    el("view-profile").querySelectorAll("[data-ptab]").forEach((b) => b.onclick = () => loadProfile(username, b.dataset.ptab));
  } catch (e) {
    el("view-profile").innerHTML = errorState(e.message || "Failed to load profile.", `profile:${esc(username || "")}`);
  }
}

function recentSearches() { try { return JSON.parse(localStorage.getItem("ig_recent_searches") || "[]").filter((x) => typeof x === "string"); } catch { return []; } }
function saveRecentSearch(q) {
  const v = String(q || "").trim().slice(0, 80); if (!v) return;
  const next = [v, ...recentSearches().filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 8);
  localStorage.setItem("ig_recent_searches", JSON.stringify(next));
}

async function loadSearch(q) {
  const query = (q || "").trim();
  const recent = recentSearches();
  if (!query) {
    setDocumentTitle("Search • Instagram Clone");
    el("view-search").innerHTML = `<div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h3 style="margin:0">Search</h3>${recent.length ? `<button id="clearRecentSearches" class="mini-btn secondary" type="button">Clear recent</button>` : ""}</div>${recent.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${recent.map((r) => `<button class="mini-btn secondary" type="button" data-recent-search="${esc(r)}">${esc(r)}</button>`).join("")}</div>` : `<div style="margin-top:12px">${emptyState("Search Instagram Clone", "Find people and posts. Recent searches will appear here.").replace('<div class="card state-card">','<div class="state-card" style="border:0;min-height:0;padding:8px 0">')}</div>`}</div>`;
    el("view-search").querySelector("#clearRecentSearches")?.addEventListener("click", () => { localStorage.removeItem("ig_recent_searches"); toast("Recent searches cleared."); loadSearch(""); });
    el("view-search").querySelectorAll("[data-recent-search]").forEach((b) => b.addEventListener("click", () => { el("searchInput").value = b.dataset.recentSearch; loadSearch(b.dataset.recentSearch); }));
    return setView("search", { skipLoad: true });
  }
  saveRecentSearch(query);
  history.replaceState(null, "", `#/search/${encodeURIComponent(query)}`);
  setDocumentTitle(`Search: ${query} • Instagram Clone`);
  el("view-search").innerHTML = loadingState(`Searching for "${esc(query)}"...`);
  try {
    const { users = [], posts = [] } = await api(`/api/search?q=${encodeURIComponent(query)}`);
    const usersHtml = users.map((u) => `<div class="notif" style="align-items:center"><img class="avatar" src="${avatar(u)}" alt="" style="width:36px;height:36px" /><div style="flex:1"><strong>@${esc(u.username)}</strong><div style="color:var(--muted);font-size:13px">${esc(u.name || "")}</div></div>${u.isMe ? `<button class="mini-btn secondary" type="button" data-user="${esc(u.username)}">View</button>` : `<button class="mini-btn ${u.isFollowing ? "secondary" : ""}" type="button" data-follow-user="${esc(u.username)}" aria-label="${u.isFollowing ? "Unfollow" : "Follow"} ${esc(u.username)}" aria-pressed="${u.isFollowing ? "true" : "false"}">${u.isFollowing ? "Following" : "Follow"}</button><button class="mini-btn secondary" type="button" data-user="${esc(u.username)}">View</button>`}</div>`).join("") || `<div style="padding:4px 0">${emptyState("No users found", `No accounts matched "${esc(query)}".`).replace('<div class="card state-card">','<div class="state-card" style="border:0;min-height:0;padding:8px 0">')}</div>`;
    const postsHtml = posts.length ? `<div class="explore-grid card" style="padding:4px;border:0">${posts.map((p) => `<img src="${esc(p.image)}" class="filter-${esc(p.filter || "none")}" data-post-id="${esc(p.id)}" alt="Post by ${esc(p.user?.username || "user")}" loading="lazy" decoding="async" tabindex="0" role="button" aria-label="Open post by ${esc(p.user?.username || "user")}" />`).join("")}</div>` : emptyState("No posts found", `No posts matched "${esc(query)}".`);
    el("view-search").innerHTML = `<div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><h3 style="margin:0">Search: ${esc(q)}</h3><small class="muted">${users.length} user${users.length === 1 ? "" : "s"} · ${posts.length} post${posts.length === 1 ? "" : "s"}</small></div><h4>Users</h4>${usersHtml}</div><div class="card" style="padding:14px"><h4 style="margin-top:0">Posts</h4></div>${postsHtml}`;
    el("view-search").querySelectorAll("button[data-user]").forEach((b) => b.onclick = () => loadProfile(b.dataset.user));
    el("view-search").querySelectorAll("button[data-follow-user]").forEach((b) => b.onclick = async () => {
      if (!state.me) return openAuth();
      const prev = b.textContent;
      b.disabled = true;
      const next = prev === "Follow";
      b.textContent = next ? "Following" : "Follow";
      b.classList.toggle("secondary", next);
      b.setAttribute("aria-label", `${next ? "Unfollow" : "Follow"} ${b.dataset.followUser}`);
      try {
        const res = await api(`/api/users/${b.dataset.followUser}/follow`, { method: "POST", body: "{}" });
        b.textContent = res.following ? "Following" : "Follow";
        b.classList.toggle("secondary", !!res.following);
        b.setAttribute("aria-label", `${res.following ? "Unfollow" : "Follow"} ${b.dataset.followUser}`);
        toast(res.following ? "Following user." : "Unfollowed.");
        refreshNotificationsBadge();
      } catch (e) { b.textContent = prev; b.setAttribute("aria-label", `${prev === "Following" ? "Unfollow" : "Follow"} ${b.dataset.followUser}`); toast(e.message, "error"); }
      finally { b.disabled = false; }
    });
    bindProfileLinks(el("view-search"));
    bindPostActions(el("view-search"));
    setView("search", { skipLoad: true });
  } catch (e) { el("view-search").innerHTML = errorState(e.message, `search:${esc(q || "")}`); setView("search", { skipLoad: true }); }
}

async function openDmWith(userId) {
  if (!state.me) return openAuth();
  state.dm.userId = userId;
  setView("messages");
}

async function renderSettings() {
  const root = el("view-settings");
  if (!root) return;
  if (!state.me) {
    root.innerHTML = `<div class="card" style="padding:16px"><h3 style="margin-top:0">Settings</h3><p class="muted">Log in to manage your account.</p><button id="settingsLoginBtn" class="mini-btn" type="button">Log in</button></div>`;
    root.querySelector("#settingsLoginBtn")?.addEventListener("click", openAuth);
    return;
  }
  root.innerHTML = `
    <div class="card" style="padding:16px;display:grid;gap:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
        <h3 style="margin:0">Settings</h3>
        <button type="button" class="mini-btn secondary" data-profile="${esc(state.me.username)}">View profile</button>
      </div>
      <section>
        <h4 style="margin:0 0 8px">Appearance</h4>
        <button id="settingsThemeBtn" type="button" class="mini-btn secondary" aria-pressed="${document.body.classList.contains("dark") ? "true" : "false"}">${document.body.classList.contains("dark") ? "Switch to light mode" : "Switch to dark mode"}</button>
      </section>
      <section>
        <h4 style="margin:0 0 8px">Change password</h4>
        <form id="passwordForm" style="display:grid;gap:8px;max-width:360px">
          <input name="currentPassword" type="password" placeholder="Current password" required minlength="6" maxlength="128" aria-label="Current password" autocomplete="current-password" />
          <input name="newPassword" type="password" placeholder="New password" required minlength="6" maxlength="128" aria-label="New password" autocomplete="new-password" />
          <button type="submit" id="passwordSubmit">Update password</button>
          <div id="passwordStatus" class="form-status" aria-live="polite"></div>
        </form>
      </section>
      <section>
        <h4 style="margin:0 0 8px">Account</h4>
        <button id="settingsLogoutBtn" type="button" class="mini-btn secondary">Log out</button>
      </section>
      <section>
        <h4 style="margin:0 0 8px">App info</h4>
        <div class="muted" style="font-size:13px;line-height:1.5">Socially MVP (local) · Node/Express + vanilla SPA · JSON data store.<br/>Theme stored in localStorage. Runtime data/uploads are local. Not the Supabase/React spec stack.</div>
      </section>
    </div>`;
  bindProfileLinks(root);
  root.querySelector("#settingsThemeBtn")?.addEventListener("click", () => el("themeBtn")?.click());
  root.querySelector("#settingsLogoutBtn")?.addEventListener("click", () => el("authBtn")?.click());
  root.querySelector("#passwordForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const currentPassword = String(fd.get("currentPassword") || "");
    const newPassword = String(fd.get("newPassword") || "");
    const status = el("passwordStatus"); const submit = el("passwordSubmit");
    status.textContent = ""; status.classList.remove("error");
    if (newPassword.length < 6) { status.textContent = "New password must be at least 6 characters."; status.classList.add("error"); return; }
    if (submit) { submit.disabled = true; submit.textContent = "Updating..."; }
    try {
      await api("/api/me/password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
      form.reset();
      status.textContent = "Password updated."; status.classList.remove("error");
      toast("Password updated.");
    } catch (err) { status.textContent = err.message; status.classList.add("error"); toast(err.message, "error"); }
    finally { if (submit) { submit.disabled = false; submit.textContent = "Update password"; } }
  });
}
async function renderMessages() {
  if (!state.me) { el("view-messages").innerHTML = emptyState("Log in to use messages", "Direct messages will appear here."); return; }
  el("view-messages").innerHTML = loadingState("Loading messages...");
  try {
    const { conversations, contacts } = await api("/api/messages/conversations");
    const list = [...conversations];
    for (const c of contacts || []) if (!list.some((x) => x.user?.id === c.id)) list.push({ user: c, last: null });
    if (!state.dm.userId && list[0]?.user?.id) state.dm.userId = list[0].user.id;
    const active = list.find((x) => x.user?.id === state.dm.userId)?.user || null;
    const thread = active ? await api(`/api/messages/${active.id}`) : { messages: [] };
    el("view-messages").innerHTML = `<div class="card dm">
      <div class="dm-list">
        <div style="padding:12px 14px;border-bottom:1px solid var(--line);font-weight:600">Messages</div>
        ${list.map((c) => `<div class="dm-item ${c.user.id === state.dm.userId ? "active" : ""}" data-dm="${c.user.id}" tabindex="0" role="button" aria-label="Open conversation with ${esc(c.user.username)}"><strong>${esc(c.user.username)}</strong><div style="color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.last?.text || "Start a conversation")}${c.last?.createdAt ? ` � ${timeAgo(c.last.createdAt)}` : ""}</div></div>`).join("") || `<div style="padding:14px;color:var(--muted)">No contacts</div>`}
      </div>
      <div class="dm-chat">
        <div class="dm-head">${active ? `<button type="button" class="profile-link" data-profile="${esc(active.username)}" style="border:0;background:none;padding:0;font:inherit;font-weight:600;color:inherit;cursor:pointer">${esc(active.username)}</button>` : "Select a conversation"}</div>
        <div class="dm-body">${(thread.messages || []).map((m) => `<div class="dm-msg ${m.from === state.me.id ? "me" : ""}"><div>${esc(m.text)}</div><div class="dm-time">${timeAgo(m.createdAt)}</div></div>`).join("") || `<div style="color:var(--muted)">${active ? "No messages yet. Say hello." : "Choose a contact to start messaging."}</div>`}</div>
        ${active ? `<form class="dm-form" id="dmForm"><input name="text" placeholder="Message..." maxlength="1000" autocomplete="off" aria-label="Message to ${esc(active.username)}" /><button type="submit" aria-label="Send message">Send</button></form>` : ``}
      </div>
    </div>`;
    el("view-messages").querySelectorAll("[data-dm]").forEach((n) => {
      const open = () => { state.dm.userId = n.dataset.dm; renderMessages(); };
      n.onclick = open;
      n.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    bindProfileLinks(el("view-messages"));
    el("dmForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = e.currentTarget.querySelector("input[name=text]");
      const btn = e.currentTarget.querySelector("button");
      const text = input.value.trim();
      if (!text || !state.dm.userId) return;
      const prev = input.value;
      input.value = "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }
      const body = el("view-messages").querySelector(".dm-body");
      const optimistic = document.createElement("div");
      optimistic.className = "dm-msg me";
      optimistic.style.opacity = "0.65";
      optimistic.innerHTML = `<div>${esc(text)}</div><div class="dm-time">Sending...</div>`;
      body?.appendChild(optimistic);
      if (body) body.scrollTop = body.scrollHeight;
      try {
        const res = await api(`/api/messages/${state.dm.userId}`, { method: "POST", body: JSON.stringify({ text }) });
        optimistic.outerHTML = `<div class="dm-msg me"><div>${esc(res.message?.text || text)}</div><div class="dm-time">${timeAgo(res.message?.createdAt || Date.now())}</div></div>`;
        const item = el("view-messages").querySelector(`.dm-item[data-dm="${state.dm.userId}"] div[style*="color:var(--muted)"]`);
        if (item) item.textContent = `${text} � ${timeAgo(Date.now())}`;
        if (body) body.scrollTop = body.scrollHeight;
      } catch (err) {
        optimistic.remove();
        input.value = prev;
        toast(err.message, "error");
      } finally { if (btn) { btn.disabled = false; btn.textContent = "Send"; } }
    });
    const body = el("view-messages").querySelector(".dm-body");
    if (body) body.scrollTop = body.scrollHeight;
  } catch (e) { el("view-messages").innerHTML = errorState(e.message, "messages"); }
}

function bindHashtags(root) {
  root.querySelectorAll("a.hashtag[data-tag]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const q = a.dataset.tag || "";
      el("searchInput").value = q;
      loadSearch(q);
    });
  });
}

function bindProfileLinks(root) {
  root.querySelectorAll("[data-profile]").forEach((n) => {
    if (n.matches?.("img.avatar.profile-link, .post-user.profile-link")) n.setAttribute("tabindex", "0");
    if (n.matches?.("img.avatar.profile-link, .post-user.profile-link") && !n.getAttribute("role")) n.setAttribute("role", "button");
    const open = (e) => {
      const u = n.dataset.profile;
      if (!u) return;
      e.preventDefault();
      e.stopPropagation();
      loadProfile(u);
    };
    n.addEventListener("click", open);
    n.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && n.dataset.profile) { e.preventDefault(); open(e); } });
  });
}

let lastFocus = null;
let prePostHash = null;
function showDialog(dialog) {
  if (!dialog) return;
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (dialog.id === "postDialog") {
    prePostHash = location.hash || "#/feed";
    const id = el("postDialogBody")?.querySelector("[data-id]")?.dataset.id;
    if (id) history.replaceState(null, "", `#/post/${encodeURIComponent(id)}`);
  }
  if (!dialog.open) dialog.showModal();
  if (dialog.id === "authDialog") dialog.querySelector('input[name="username"]')?.focus?.();
  if (dialog.id === "profileEditDialog") dialog.querySelector('input[name="name"]')?.focus?.();
}
function closeDialog(dialog) {
  if (!dialog?.open) return;
  dialog.close();
  if (dialog.id === "postDialog" && location.hash.startsWith("#/post/")) {
    const target = prePostHash && !prePostHash.startsWith("#/post/") ? prePostHash : (state.view === "profile" ? `#/profile` : `#/${state.view || "feed"}`);
    history.replaceState(null, "", target);
  }
  prePostHash = null;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

function bindPostOpen(root) {
  root.querySelectorAll(".post-image, .grid img[data-post-id], .explore-grid img[data-post-id]").forEach((img) => {
    const open = async (e) => {
      if (e.target.closest(".post-actions,.comment-form,.delete-post-btn")) return;
      const postId = img.closest("[data-id]")?.dataset.id || img.dataset.postId;
      if (!postId) return;
      try {
        const { post } = await api(`/api/posts/${postId}`);
        el("postDialogBody").innerHTML = postHtml(post);
        bindPostActions(el("postDialogBody"));
        showDialog(el("postDialog"));
        el("postDialogBody").querySelector(".comment-focus-btn, .like-btn, button, [tabindex]")?.focus?.();
      } catch (err) { toast(err.message, "error"); }
    };
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
  });
}

function bindPostActions(root) {
  if (!root) return;
  bindHashtags(root);
  bindProfileLinks(root);
  bindPostOpen(root);
  const posts = root.classList?.contains("post") ? [root] : Array.from(root.querySelectorAll(".post"));
  posts.forEach((postEl) => {
    postEl.querySelector(".open-image-btn")?.addEventListener("click", () => {
      const url = postEl.querySelector(".post-image")?.getAttribute("src") || "";
      if (url) window.open(url, "_blank", "noopener,noreferrer"); else toast("No image URL.", "error");
    });
    postEl.querySelector(".copy-image-btn")?.addEventListener("click", async () => {
      const url = postEl.querySelector(".post-image")?.getAttribute("src") || "";
      try { if (url && navigator.clipboard?.writeText) await navigator.clipboard.writeText(url); else prompt("Image URL:", url || ""); toast(url ? "Image link copied." : "No image URL."); } catch { toast("Could not copy image link.", "error"); }
    });
    postEl.querySelector(".copy-caption-btn")?.addEventListener("click", async () => {
      const caption = (postEl.querySelector(".caption-text")?.textContent || "").trim();
      try { if (caption && navigator.clipboard?.writeText) await navigator.clipboard.writeText(caption); else prompt("Caption:", caption || ""); toast(caption ? "Caption copied." : "No caption to copy."); } catch { toast("Could not copy caption.", "error"); }
    });
    postEl.querySelector(".comment-focus-btn")?.addEventListener("click", () => {
      if (!state.me) return openAuth();
      postEl.querySelector('.comment-form input[name="text"]')?.focus();
    });
    postEl.querySelector(".share-post-btn")?.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#/post/${encodeURIComponent(postEl.dataset.id)}`;
      const btn = postEl.querySelector(".share-post-btn");
      try {
        if (navigator.share) {
          await navigator.share({ title: "Instagram Clone post", url });
          toast("Post shared.");
          return;
        }
        await navigator.clipboard?.writeText(url);
        if (btn) { btn.textContent = "Copied"; setTimeout(() => { if (btn) btn.textContent = "Share"; }, 1500); }
        toast("Post link copied.");
      } catch (e) {
        if (e?.name === "AbortError") return;
        try { await navigator.clipboard?.writeText(url); toast("Post link copied."); }
        catch { prompt("Copy post link:", url); toast("Copy the post link from the prompt."); }
      }
    });
    postEl.querySelector(".delete-post-btn")?.addEventListener("click", async () => {
      if (!state.me || !confirm("Delete this post?")) return;
      try {
        await api(`/api/posts/${postEl.dataset.id}`, { method: "DELETE" });
        toast("Post deleted.");
        if (state.view === "saved") loadSaved(); else if (state.view === "feed") loadFeed(true); else if (state.view === "profile") loadProfile(state.me.username); else loadFeed(true);
      } catch (e) { toast(e.message, "error"); }
    });
    postEl.querySelector(".like-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      const btn = postEl.querySelector(".like-btn");
      const likesEl = postEl.querySelector(".post-likes");
      const prevLiked = btn.classList.contains("liked");
      const prevCount = Number((likesEl.textContent || "0").match(/\d+/)?.[0] || 0);
      const nextLiked = !prevLiked;
      btn.classList.toggle("liked", nextLiked);
      btn.setAttribute("aria-pressed", String(nextLiked));
      btn.setAttribute("aria-label", nextLiked ? "Unlike" : "Like");
      btn.textContent = nextLiked ? "Liked" : "Like";
      likesEl.textContent = `${Math.max(0, prevCount + (nextLiked ? 1 : -1))} likes`;
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/like`, { method: "POST", body: "{}" });
        btn.classList.toggle("liked", res.liked);
        btn.setAttribute("aria-pressed", String(res.liked));
        btn.setAttribute("aria-label", res.liked ? "Unlike" : "Like");
        btn.textContent = res.liked ? "Liked" : "Like";
        likesEl.textContent = `${res.likesCount} likes`;
      } catch (e) {
        btn.classList.toggle("liked", prevLiked);
        btn.setAttribute("aria-pressed", String(prevLiked));
        btn.setAttribute("aria-label", prevLiked ? "Unlike" : "Like");
        btn.textContent = prevLiked ? "Liked" : "Like";
        likesEl.textContent = `${prevCount} likes`;
        toast(e.message, "error");
      }
    });
    postEl.querySelector(".save-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      const btn = postEl.querySelector(".save-btn");
      const prevSaved = btn.classList.contains("saved");
      const nextSaved = !prevSaved;
      btn.classList.toggle("saved", nextSaved);
      btn.textContent = nextSaved ? "Saved" : "Save";
      btn.setAttribute("aria-pressed", String(nextSaved));
      btn.setAttribute("aria-label", nextSaved ? "Remove from saved" : "Save");
      if (state.view === "saved" && !nextSaved) postEl.style.opacity = "0.45";
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/save`, { method: "POST", body: "{}" });
        btn.classList.toggle("saved", res.saved);
        btn.textContent = res.saved ? "Saved" : "Save";
        btn.setAttribute("aria-pressed", String(res.saved));
        btn.setAttribute("aria-label", res.saved ? "Remove from saved" : "Save");
        postEl.style.opacity = "";
        if (state.view === "saved" && !res.saved) loadSaved();
      } catch (e) {
        btn.classList.toggle("saved", prevSaved);
        btn.textContent = prevSaved ? "Saved" : "Save";
        btn.setAttribute("aria-pressed", String(prevSaved));
        btn.setAttribute("aria-label", prevSaved ? "Remove from saved" : "Save");
        postEl.style.opacity = "";
        toast(e.message, "error");
      }
    });
    postEl.querySelectorAll(".comment-like-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!state.me) return openAuth();
        const commentId = btn.closest(".comment")?.dataset.commentId;
        const prevLiked = btn.classList.contains("liked");
        const prevCount = Number((btn.textContent || "0").match(/\d+/)?.[0] || 0);
        const nextLiked = !prevLiked;
        btn.classList.toggle("liked", nextLiked);
        btn.textContent = `Like ${Math.max(0, prevCount + (nextLiked ? 1 : -1))}`;
        btn.setAttribute("aria-pressed", String(nextLiked));
        btn.setAttribute("aria-label", nextLiked ? "Unlike comment" : "Like comment");
        try {
          const res = await api(`/api/posts/${postEl.dataset.id}/comments/${commentId}/like`, { method: "POST", body: "{}" });
          btn.classList.toggle("liked", res.liked);
          btn.textContent = `Like ${res.likesCount}`;
          btn.setAttribute("aria-pressed", String(res.liked));
          btn.setAttribute("aria-label", res.liked ? "Unlike comment" : "Like comment");
        } catch (e) {
          btn.classList.toggle("liked", prevLiked);
          btn.textContent = `Like ${prevCount}`;
          btn.setAttribute("aria-pressed", String(prevLiked));
          btn.setAttribute("aria-label", prevLiked ? "Unlike comment" : "Like comment");
        toast(e.message, "error");
        }
      });
    });
    postEl.querySelectorAll(".comment-delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!state.me || !confirm("Delete this comment?")) return;
        const commentId = btn.closest(".comment")?.dataset.commentId;
        const node = btn.closest(".comment");
        node?.style.setProperty("opacity", "0.45");
        try {
          await api(`/api/posts/${postEl.dataset.id}/comments/${commentId}`, { method: "DELETE" });
          node?.remove();
          toast("Comment deleted.");
        } catch (e) { if (node) node.style.opacity = ""; toast(e.message, "error"); }
      });
    });
    postEl.querySelector(".comment-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.me) return openAuth();
      const input = e.currentTarget.querySelector("input[name=text]");
      const text = input.value.trim();
      if (!text) return;
      const list = postEl.querySelector(".comments");
      const tempId = `tmp_${Date.now()}`;
      const optimistic = document.createElement("div");
      optimistic.className = "comment";
      optimistic.dataset.commentId = tempId;
      optimistic.style.opacity = "0.6";
      optimistic.innerHTML = `<span><strong class="profile-link" data-profile="${esc(state.me.username)}">${esc(state.me.username)}</strong> ${esc(text)}</span><span class="comment-actions"><button class="comment-like-btn" type="button" disabled>Like 0</button></span>`;
      list?.appendChild(optimistic);
      input.value = "";
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/comments`, { method: "POST", body: JSON.stringify({ text }) });
        optimistic.outerHTML = `<div class="comment" data-comment-id="${res.comment.id}" data-comment-user="${state.me.id}"><span><strong class="profile-link" data-profile="${esc(state.me.username)}">${esc(state.me.username)}</strong> ${esc(res.comment.text || text)}</span><span class="comment-actions"><button class="comment-like-btn" type="button" aria-label="Like comment" aria-pressed="false">Like ${res.comment.likesCount || 0}</button><button class="comment-delete-btn" type="button" aria-label="Delete comment">Delete</button></span></div>`;
        bindPostActions(postEl);
        refreshNotificationsBadge();
      } catch (err) { optimistic.remove(); input.value = text; toast(err.message, "error"); }
    });
  });
}

function openAuth(mode = "login") {
  state.authMode = mode;
  el("authTitle").textContent = mode === "login" ? "Log in" : "Sign up";
  el("authToggle").textContent = mode === "login" ? "Need an account?" : "Have an account?";
  el("authForm").querySelector('input[name=name]').classList.toggle("hidden", mode === "login");
  el("authError").textContent = "";
  showDialog(el("authDialog"));
}

async function loadMe() {
  const { user } = await api("/api/me");
  state.me = user;
  renderMe();
  refreshNotificationsBadge();
}

async function loadSuggestions() {
  try {
    const { users = [] } = await api("/api/search?q=a");
    await renderSuggestions(users);
  } catch {}
}

el("authBtn").onclick = async () => {
  if (state.me) {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
    state.me = null; state.dm.userId = null; state.feed.offset = 0; state.feed.hasMore = true;
    renderMe(); updateBadge(0); loadSuggestions();
    closeDialog(el("postDialog")); closeDialog(el("storyDialog")); closeDialog(el("profileEditDialog"));
    setView("feed"); toast("Logged out.");
  }
  else openAuth("login");
};
el("authToggle").onclick = () => openAuth(state.authMode === "login" ? "signup" : "login");
el("profileEditCancel")?.addEventListener("click", () => closeDialog(el("profileEditDialog")));
el("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  const username = String(payload.username || "").trim();
  const password = String(payload.password || "");
  if (!/^[A-Za-z0-9._]{3,30}$/.test(username)) { el("authError").textContent = "Username must be 3-30 chars: letters, numbers, dot, underscore."; return; }
  if (password.length < 6) { el("authError").textContent = "Password must be at least 6 characters."; return; }
  payload.username = username;
  try {
    const path = state.authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const { user } = await api(path, { method: "POST", body: JSON.stringify(payload) });
    state.me = user; renderMe(); closeDialog(el("authDialog")); toast(state.authMode === "login" ? "Logged in." : "Account created."); setView("feed");
  } catch (err) { el("authError").textContent = err.message; }
});

document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
document.querySelector(".brand")?.addEventListener("click", () => { closeDialog(el("postDialog")); setView("feed"); });
el("newPostBtn").onclick = () => { if (!state.me) return openAuth(); const c = el("composer"); c.classList.toggle("hidden"); el("newPostBtn").setAttribute("aria-expanded", String(!c.classList.contains("hidden"))); if (!c.classList.contains("hidden")) c.querySelector('input[name="image"]')?.focus?.(); };
function updatePostPreview() {
  const form = el("postForm"); if (!form) return;
  const file = form.querySelector('input[name="image"]')?.files?.[0];
  const url = form.querySelector('input[name="imageUrl"]')?.value?.trim();
  const filter = form.querySelector('select[name="filter"]')?.value || "none";
  const src = file ? URL.createObjectURL(file) : url;
  const wrap = el("postPreviewWrap"); const img = el("postPreview");
  if (src) { img.src = src; img.className = `post-preview filter-${esc(filter)}`; wrap.classList.remove("hidden"); }
  else { wrap.classList.add("hidden"); img.removeAttribute("src"); }
}
el("postForm")?.querySelector('input[name="image"]')?.addEventListener("change", updatePostPreview);
el("postForm")?.querySelector('input[name="imageUrl"]')?.addEventListener("input", updatePostPreview);
el("postForm")?.querySelector('select[name="filter"]')?.addEventListener("change", updatePostPreview);
function updateCaptionCount() {
  const ta = el("postCaption"); const out = el("captionCount"); if (!ta || !out) return;
  out.textContent = `${ta.value.length}/2200`;
}
el("postCaption")?.addEventListener("input", updateCaptionCount);
el("postFormReset")?.addEventListener("click", () => { el("postForm")?.reset(); updatePostPreview(); updateCaptionCount(); el("postFormStatus").textContent = ""; el("postFormStatus").classList.remove("error"); });
el("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.currentTarget.value.trim()) {
    const q = e.currentTarget.value.trim();
    if (state.view === "explore") loadExplore(q); else loadSearch(q);
  }
  if (e.key === "Escape" && e.currentTarget.value) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.value = "";
    e.currentTarget.blur();
    if (state.view === "search") setView("explore");
  }
});
el("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.me) return openAuth();
  const form = e.currentTarget;
  const fd = new FormData(form);
  const status = el("postFormStatus"); const submit = el("postFormSubmit");
  if (!fd.get("image")?.size && !String(fd.get("imageUrl") || "").trim()) {
    status.textContent = "Choose an image file or provide an image URL."; status.classList.add("error"); return;
  }
  status.textContent = "Sharing post..."; status.classList.remove("error");
  if (submit) { submit.disabled = true; submit.textContent = "Sharing..."; }
  try {
    const res = await fetch("/api/posts", { method: "POST", body: fd, credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    form.reset(); updatePostPreview(); updateCaptionCount();
    status.textContent = "Post shared."; status.classList.remove("error");
    toast("Post shared.");
    el("composer").classList.add("hidden");
    if (data.post) {
      state.feed.offset = (state.feed.offset || 0) + 1;
      const wrap = document.createElement("div");
      wrap.innerHTML = postHtml(data.post);
      bindPostActions(wrap);
      const feed = el("view-feed");
      feed.querySelectorAll('.card.state-card').forEach((n) => { if ((n.textContent || '').includes('No posts yet')) n.remove(); });
      feed.prepend(wrap.firstElementChild);
    } else {
      await loadFeed(true);
    }
  } catch (err) { status.textContent = err.message; status.classList.add("error"); toast(err.message, "error"); }
  finally { if (submit) { submit.disabled = false; submit.textContent = "Share"; } setTimeout(() => { if (status?.textContent === "Post shared.") status.textContent = ""; }, 2000); }
});
el("storyForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.me) return openAuth();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  const image = String(payload.image || "").trim();
  if (!/^https?:\/\//i.test(image)) { toast("Story image must be a valid http(s) URL.", "error"); return; }
  payload.image = image;
  try {
    await api("/api/stories", { method: "POST", body: JSON.stringify(payload) });
    e.currentTarget.reset();
    el("storyCreator").classList.add("hidden");
    await loadStories();
    toast("Story shared.");
  } catch (err) { toast(err.message, "error"); }
});
el("profileEditForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.me) return openAuth();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  const avatar = String(payload.avatar || "").trim();
  if (avatar && !/^https?:\/\//i.test(avatar) && !avatar.startsWith("/uploads/")) {
    el("profileEditError").textContent = "Avatar must be an http(s) URL or /uploads/ path."; return;
  }
  payload.avatar = avatar;
  try {
    const { user } = await api("/api/me/profile", { method: "POST", body: JSON.stringify(payload) });
    state.me = user;
    renderMe();
    closeDialog(el("profileEditDialog"));
    loadProfile(user.username);
    toast("Profile updated.");
  } catch (err) { el("profileEditError").textContent = err.message; }
});

async function refreshHealth() {
  const target = el("healthText");
  const time = el("healthTime");
  if (!target) return;
  try {
    const res = await fetch("/api/health", { credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    const ok = res.ok && data.ok;
    target.textContent = ok ? "Server connected" : "Server issue";
    target.style.color = ok ? "" : "#c00";
    if (time) time.textContent = ok ? `Checked ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "";
  } catch {
    target.textContent = "Server offline";
    target.style.color = "#c00";
    if (time) time.textContent = "";
  }
}

function applyTheme() {
  const dark = localStorage.getItem("ig_theme") === "dark";
  document.body.classList.toggle("dark", dark);
  const btn = el("themeBtn");
  if (btn) btn.textContent = dark ? "Light" : "Dark";
  if (btn) btn.setAttribute("aria-pressed", String(dark));
}
el("themeBtn")?.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("ig_theme", dark ? "dark" : "light");
  const btn = el("themeBtn");
  if (btn) { btn.textContent = dark ? "Light" : "Dark"; btn.setAttribute("aria-pressed", String(dark)); }
  toast(dark ? "Dark mode on." : "Light mode on.");
});
el("postDialogClose")?.addEventListener("click", () => closeDialog(el("postDialog")));
el("postDialog")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeDialog(e.currentTarget); });
el("listDialogClose")?.addEventListener("click", () => closeDialog(el("listDialog")));
el("listDialog")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeDialog(e.currentTarget); });
applyTheme();
setupFeedObserver();
refreshHealth();
setInterval(refreshHealth, 30000);

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-retry-action]");
  if (!btn) return;
  const action = btn.getAttribute("data-retry-action") || "";
  if (action === "feed") return loadFeed(true);
  if (action === "explore") return loadExplore(el("searchInput")?.value || "");
  if (action === "saved") return loadSaved();
  if (action === "notifications") return loadNotifications();
  if (action === "messages") return loadMessages();
  if (action.startsWith("profile:")) return loadProfile(action.slice(8));
  if (action.startsWith("search:")) return loadSearch(action.slice(7));
});
ddocument.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (e.target?.id === "searchInput" && e.target.value) return;
  ["postDialog", "storyDialog", "authDialog", "profileEditDialog"].forEach((id) => { const d = el(id); if (d?.open) closeDialog(d); });
});

document.addEventListener("keydown", (e) => {
  const story = el("storyDialog");
  if (!story?.open) return;
  if (e.key === "ArrowLeft") { e.preventDefault(); if (state.storyIndex > 0) { state.storyIndex--; renderStory(); } }
  if (e.key === "ArrowRight") { e.preventDefault(); if (state.storyIndex < state.stories.length - 1) { state.storyIndex++; renderStory(); } else closeDialog(story); }
});

async function handleRoute() {
  const route = routeHash();
  if (!route || route === "feed") return setView("feed", { fromHash: true });
  if (route.startsWith("profile/")) {
    const rest = route.slice("profile/".length);
    const parts = rest.split("/").map((p) => decodeURIComponent(p || ""));
    const username = parts[0] || "";
    const tab = parts[1] === "saved" ? "saved" : "posts";
    return loadProfile(username, tab, { fromRoute: true });
  }
  if (route === "profile") return loadProfile(state.me?.username, "posts", { fromRoute: true });
  if (route.startsWith("search/")) {
    const q = decodeURIComponent(route.slice("search/".length));
    el("searchInput").value = q;
    return loadSearch(q);
  }
  if (route.startsWith("post/")) {
    const id = decodeURIComponent(route.slice("post/".length));
    setView("feed", { fromHash: true });
    if (id) try {
      const { post } = await api(`/api/posts/${id}`);
      el("postDialogBody").innerHTML = postHtml(post);
      bindPostActions(el("postDialogBody"));
      showDialog(el("postDialog"));
    } catch (e) { toast(e.message || "Post not found.", "error"); history.replaceState(null, "", "#/feed"); }
    return;
  }
  if (views.includes(route)) return setView(route, { fromHash: true });
  setView("feed", { fromHash: true });
}
window.addEventListener("hashchange", handleRoute);

await loadMe();
await loadStories();
renderMessages();
await handleRoute();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
