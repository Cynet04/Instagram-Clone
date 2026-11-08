const state = { me: null, view: "feed", authMode: "login", feed: { offset: 0, limit: 5, hasMore: true, loading: false }, dm: { userId: null }, stories: [], storyIndex: 0 };

const el = (id) => document.getElementById(id);
const views = ["feed", "explore", "notifications", "saved", "messages", "profile", "search"];
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
  return `<div class="card state-card" role="status" aria-live="polite"><div class="state-spinner" aria-hidden="true"></div><div>${esc(message)}</div></div>`;
}
function emptyState(title, detail = "") {
  return `<div class="card state-card"><div class="state-title">${esc(title)}</div>${detail ? `<div class="state-detail">${esc(detail)}</div>` : ""}</div>`;
}
function errorState(message) {
  return `<div class="card state-card state-error"><div class="state-title">Something went wrong</div><div class="state-detail">${esc(message)}</div></div>`;
}

function formatCaption(text = "") {
  const safe = esc(text);
  return safe.replace(/(^|[\s(])#([\p{L}\p{N}_]+)/gu, (m, pre, tag) => `${pre}<a href="#" class="hashtag" data-tag="#${esc(tag)}">#${esc(tag)}</a>`);
}

function avatar(user) {
  const name = encodeURIComponent(user?.username || "user");
  return user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${name}`;
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function setNavActive(view) {
  document.querySelectorAll("[data-nav-view]").forEach((b) => b.classList.toggle("active", b.dataset.navView === view));
}

function routeHash() {
  return location.hash.replace(/^#\/?/, "");
}

function setView(view, opts = {}) {
  state.view = view;
  setNavActive(view);
  if (!opts.fromHash) {
    const next = view === "profile" && opts.username ? `#/profile/${encodeURIComponent(opts.username)}` : `#/${view}`;
    if (location.hash !== next) history.replaceState(null, "", next);
  }
  for (const v of views) el(`view-${v}`)?.classList.toggle("hidden", v !== view);
  el("stories").classList.toggle("hidden", view !== "feed");
  el("composer").classList.toggle("hidden", view !== "feed" || !state.me);
  el("storyCreator")?.classList.add("hidden");
  el("feedSentinel")?.classList.toggle("hidden", view !== "feed");
  if (opts.skipLoad) return;
  if (view === "feed") loadFeed();
  if (view === "explore") loadExplore();
  if (view === "notifications") loadNotifications();
  if (view === "saved") loadSaved();
  if (view === "messages") renderMessages();
  if (view === "profile") loadProfile(opts.username || state.me?.username, opts.tab || "posts", { fromRoute: !!opts.fromHash });
}

function renderMe() {
  const box = el("meCard");
  const authBtn = el("authBtn");
  if (!state.me) {
    box.innerHTML = `<div class="meta"><strong>Welcome</strong><small>Log in to post, like, and comment.</small></div>`;
    authBtn.textContent = "Log in";
    return;
  }
  authBtn.textContent = "Log out";
  box.innerHTML = `
    <img class="avatar" src="${avatar(state.me)}" alt="" />
    <div class="meta"><strong>${esc(state.me.username)}</strong><small>${esc(state.me.name || "")}</small></div>
  `;
}

async function renderSuggestions(users = []) {
  const base = users.filter((u) => u.username !== state.me?.username);
  let picks = base.slice(0, 5);
  if (state.me && base.length) {
    try {
      const details = await Promise.all(base.slice(0, 8).map((u) => api(`/api/users/${encodeURIComponent(u.username)}`).then((d) => ({ ...u, isFollowing: d.isFollowing })).catch(() => ({ ...u, isFollowing: false }))));
      picks = details.filter((u) => !u.isFollowing).slice(0, 5);
      if (!picks.length) picks = details.slice(0, 5);
    } catch {}
  }
  el("suggestions").innerHTML = picks.map((u) => `
    <div class="suggestion">
      <img class="avatar" src="${avatar(u)}" alt="" />
      <div style="flex:1"><div><strong>${esc(u.username)}</strong></div><small class="muted">Suggested for you</small></div>
      <div style="display:flex;gap:8px">
        <button data-follow-user="${esc(u.username)}" class="mini-btn ${u.isFollowing ? "secondary" : ""}" style="padding:4px 8px;font-size:12px">${u.isFollowing ? "Following" : "Follow"}</button>
        <button data-user="${esc(u.username)}">View</button>
      </div>
    </div>`).join("") || `<small class="muted">No suggestions yet.</small>`;
  el("suggestions").querySelectorAll("button[data-user]").forEach((b) => b.onclick = () => loadProfile(b.dataset.user));
  el("suggestions").querySelectorAll("button[data-follow-user]").forEach((b) => b.onclick = async () => {
    if (!state.me) return openAuth();
    try { await api(`/api/users/${encodeURIComponent(b.dataset.followUser)}/follow`, { method: "POST", body: "{}" }); loadFeed(true); refreshNotificationsBadge(); } catch (e) { alert(e.message); }
  });
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
      <img class="post-image filter-${filter}" src="${esc(p.image)}" alt="Post by ${esc(p.user?.username || "user")}${p.caption ? `: ${esc(String(p.caption).slice(0, 80))}` : ""}" loading="lazy" title="Open post details" tabindex="0" role="button" aria-label="Open post details by ${esc(p.user?.username || "user")}" onerror="this.onerror=null;this.src='${fallback}'" />
      <div class="post-actions">
        <button class="like-btn ${p.likedByMe ? "liked" : ""}" aria-label="Like">Like</button>
        <button class="comment-focus-btn" type="button" aria-label="Comment">Comment</button>
        <button class="share-post-btn" type="button" aria-label="Copy post link" title="Copy post link">Share</button>
        <button class="save-btn ${p.savedByMe ? "saved" : ""}" aria-label="Save" style="margin-left:auto">${p.savedByMe ? "Saved" : "Save"}</button>
      </div>
      <div class="post-likes">${p.likesCount} likes</div>
      <div class="post-caption"><strong class="profile-link" data-profile="${esc(p.user?.username || "")}">${esc(p.user?.username || "")}</strong> <span class="caption-text">${formatCaption(p.caption || "")}</span></div>
      <div class="comments">${(p.comments || []).map((c) => {
        const canDelete = state.me && (c.user?.id === state.me.id || mine);
        return `
        <div class="comment" data-comment-id="${c.id}" data-comment-user="${c.user?.id || ""}">
          <span><strong class="profile-link" data-profile="${esc(c.user?.username || "")}">${esc(c.user?.username || "user")}</strong> ${esc(c.text)}</span>
          <span class="comment-actions">
            <button class="comment-like-btn ${c.likedByMe ? "liked" : ""}" type="button" aria-label="Like comment">Like ${c.likesCount || 0}</button>
            ${canDelete ? `<button class="comment-delete-btn" type="button" aria-label="Delete comment">Delete</button>` : ""}
          </span>
        </div>`; }).join("")}</div>
      <form class="comment-form">
        <input name="text" placeholder="Add a comment..." maxlength="500" ${state.me ? "" : "disabled"} />
        <button ${state.me ? "" : "disabled"}>Post</button>
      </form>
    </article>`;
}

async function loadStories() {
  const { stories } = await api("/api/stories");
  state.stories = stories || [];
  const add = state.me ? `<button class="story story-add" type="button" id="addStoryBtn"><span class="story-plus">+</span><span>Your story</span></button>` : "";
  el("stories").innerHTML = add + state.stories.map((s, i) => `
    <button class="story" type="button" data-story-index="${i}" aria-label="View story by ${esc(s.user?.username || "user")}"><img src="${avatar(s.user)}" alt="" /><span>${esc(s.user?.username || "story")}</span></button>`).join("") || (add ? "" : `<div class="story"><span>No stories</span></div>`);
  el("stories").querySelectorAll("[data-story-index]").forEach((b) => b.onclick = () => openStory(Number(b.dataset.storyIndex)));
  el("addStoryBtn")?.addEventListener("click", () => el("storyCreator").classList.toggle("hidden"));
}

function renderStory() {
  const s = state.stories[state.storyIndex];
  if (!s) return;
  el("storyImage").src = s.image;
  el("storyMeta").textContent = `${s.user?.username || "story"} • ${timeAgo(s.createdAt)}`;
}

function openStory(index = 0) {
  if (!state.stories.length) return;
  state.storyIndex = Math.max(0, Math.min(index, state.stories.length - 1));
  renderStory();
  showDialog(el("storyDialog"));
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
  if (!reset) el("view-feed").insertAdjacentHTML("beforeend", `<div id="${statusId}" class="feed-status">Loading more posts...</div>`);
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
    if (!state.feed.hasMore && el("view-feed").children.length) el("view-feed").insertAdjacentHTML("beforeend", `<div class="feed-status">You're all caught up.</div>`);
  } catch (e) {
    el(statusId)?.remove();
    if (!el("view-feed").children.length || reset) el("view-feed").innerHTML = errorState(e.message);
    else el("view-feed").insertAdjacentHTML("beforeend", `<div class="feed-status">${esc(e.message)}</div>`);
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
        ${query ? `<button id="clearExplore" class="mini-btn secondary">Clear</button>` : ""}
      </div>
      <div class="explore-grid">${posts.map((p) => `<img class="filter-${esc(p.filter || "none")}" src="${esc(p.image)}" alt="Explore post by ${esc(p.user?.username || "user")}" loading="lazy" data-post-id="${p.id}" title="Open post by ${esc(p.user?.username || "")}" tabindex="0" role="button" aria-label="Open post by ${esc(p.user?.username || "user")}" onerror="this.style.opacity='0.35'" />`).join("") || ""}</div>
      ${posts.length ? "" : emptyState("No posts found", query ? "Try a different search." : "Posts will appear here.")}
    </div>`;
    bindPostOpen(el("view-explore"));
    el("clearExplore")?.addEventListener("click", () => { el("searchInput").value = ""; loadExplore(""); });
  } catch (e) { el("view-explore").innerHTML = errorState(e.message); }
}

async function loadSaved() {
  if (!state.me) { el("view-saved").innerHTML = emptyState("Log in to view saved posts", "Your saved posts will appear here."); return; }
  el("view-saved").innerHTML = loadingState("Loading saved posts...");
  try {
    const { posts } = await api("/api/saved");
    el("view-saved").innerHTML = `<div class="card" style="padding:14px"><h3 style="margin:0">Saved</h3></div>` + (posts.map(postHtml).join("") || emptyState("No saved posts yet", "Save posts from your feed to see them here."));
    bindPostActions(el("view-saved"));
  } catch (e) { el("view-saved").innerHTML = errorState(e.message); }
}

async function loadNotifications() {
  if (!state.me) { el("view-notifications").innerHTML = emptyState("Log in to view notifications", "Likes, comments, and follows will appear here."); return; }
  el("view-notifications").innerHTML = loadingState("Loading notifications...");
  try {
    const { notifications, unread } = await api("/api/notifications");
    updateBadge(unread);
    el("view-notifications").innerHTML = `<div class="card"><div style="padding:14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Notifications</h3><button id="markReadBtn" style="border:0;background:none;color:var(--blue);font-weight:600">Mark read</button></div>` +
      (notifications.map((n) => {
        const actor = esc(n.actor?.username || "Someone");
        const msg = n.type === "like" ? "liked your post" : n.type === "comment" ? `commented: ${esc(n.text || "")}` : n.type === "comment_like" ? "liked your comment" : n.type === "follow" ? "started following you" : "interacted with you";
        const postId = n.post?.id || "";
        const profile = n.actor?.username || "";
        return `<button type="button" class="notif notif-link ${n.read ? "" : "unread"}" data-notif-post="${esc(postId)}" data-notif-profile="${esc(profile)}" data-notif-type="${esc(n.type || "")}"><img class="avatar" src="${avatar(n.actor)}" alt="" style="width:34px;height:34px" /><span class="notif-text"><strong>${actor}</strong> ${msg}<span class="notif-time">${timeAgo(n.createdAt)}</span></span></button>`;
      }).join("") || `<div style="padding:16px">${emptyState("No notifications yet", "When people interact with you, you'll see it here.").replace('<div class="card state-card">','<div class="state-card" style="border:0">')}</div>`) + `</div>`;
    el("markReadBtn")?.addEventListener("click", async () => { await api("/api/notifications/read", { method: "POST", body: "{}" }); loadNotifications(); });
    el("view-notifications").querySelectorAll("[data-notif-post],[data-notif-profile]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (btn.classList.contains("unread")) {
          btn.classList.remove("unread");
          updateBadge(Math.max(0, Number(el("notifBadge")?.textContent || 0) - 1));
          api("/api/notifications/read", { method: "POST", body: JSON.stringify({ ids: [] }) }).catch(() => {});
        }
        const postId = btn.dataset.notifPost;
        const profile = btn.dataset.notifProfile;
        try {
          if (postId) {
            const { post } = await api(`/api/posts/${postId}`);
            el("postDialogBody").innerHTML = postHtml(post);
            bindPostActions(el("postDialogBody"));
            showDialog(el("postDialog"));
          } else if (profile) {
            loadProfile(profile);
          }
        } catch (e) { alert(e.message); }
      });
    });
  } catch (e) { el("view-notifications").innerHTML = errorState(e.message); }
}

function updateBadge(n = 0) {
  const b = el("notifBadge");
  if (!b) return;
  b.textContent = String(n);
  b.classList.toggle("hidden", !state.me || n <= 0);
}

async function refreshNotificationsBadge() {
  if (!state.me) return updateBadge(0);
  try { const { unread } = await api("/api/notifications"); updateBadge(unread); } catch { updateBadge(0); }
}

async function loadProfile(username, tab = "posts", opts = {}) {
  if (!username) {
    if (location.hash.startsWith("#/profile/") && !opts.fromRoute) history.replaceState(null, "", "#/profile");
    el("view-profile").innerHTML = emptyState("Log in to view your profile", "Your profile and posts will appear here.");
    setView("profile", { skipLoad: true, fromHash: opts.fromRoute });
    return;
  }
  const hash = `#/profile/${encodeURIComponent(username)}`;
  if (location.hash !== hash) history.replaceState(null, "", hash);
  el("view-profile").innerHTML = loadingState("Loading profile...");
  setView("profile", { skipLoad: true, fromHash: opts.fromRoute, username });
  try {
    const { user, posts, followers = 0, following = 0, isFollowing = false, isMe = false } = await api(`/api/users/${encodeURIComponent(username)}`);
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
              ${state.me && !isMe ? `<button id="followBtn" class="mini-btn ${isFollowing ? "secondary" : ""}">${isFollowing ? "Following" : "Follow"}</button>` : ""}
              ${isMe ? `<button id="editProfileBtn" class="mini-btn secondary">Edit profile</button>` : ""}
              <button id="shareProfileBtn" class="mini-btn secondary" title="Copy profile link">Share</button>
            </div>
            <div style="display:flex;gap:16px;margin:8px 0"><span><strong>${posts.length}</strong> posts</span><span><strong id="followersCount">${followers}</strong> followers</span><span><strong>${following}</strong> following</span></div>
            <div><strong>${esc(user.name || "")}</strong></div>
            <div>${esc(user.bio || "")}</div>
          </div>
        </div>
        ${isMe ? `<div class="profile-tabs"><button data-ptab="posts" class="${tab === "posts" ? "active" : ""}">Posts</button><button data-ptab="saved" class="${tab === "saved" ? "active" : ""}">Saved</button></div>` : ""}
      </div>
      <div class="card" style="padding:4px"><div class="grid">${gridPosts.map((p) => `<img class="filter-${esc(p.filter || "none")}" src="${esc(p.image)}" alt="Post by ${esc(user.username)}" loading="lazy" data-post-id="${p.id}" title="Open post details" tabindex="0" role="button" aria-label="Open post details" onerror="this.style.opacity='0.35'" />`).join("") || `<div style="padding:16px">No ${tab === "saved" ? "saved posts" : "posts"}</div>`}</div></div>`;
    bindPostOpen(el("view-profile"));
    el("followBtn")?.addEventListener("click", async () => {
      const btn = el("followBtn");
      const count = el("followersCount");
      const prevFollowing = btn.classList.contains("secondary");
      const prevCount = Number((count?.textContent || "0").match(/\d+/)?.[0] || 0);
      const nextFollowing = !prevFollowing;
      btn.classList.toggle("secondary", nextFollowing);
      btn.textContent = nextFollowing ? "Following" : "Follow";
      if (count) count.textContent = String(Math.max(0, prevCount + (nextFollowing ? 1 : -1)));
      try {
        const res = await api(`/api/users/${encodeURIComponent(user.username)}/follow`, { method: "POST", body: "{}" });
        btn.classList.toggle("secondary", !!res.following);
        btn.textContent = res.following ? "Following" : "Follow";
        if (count && typeof res.followers === "number") count.textContent = String(res.followers);
        refreshNotificationsBadge();
      } catch (e) {
        btn.classList.toggle("secondary", prevFollowing);
        btn.textContent = prevFollowing ? "Following" : "Follow";
        if (count) count.textContent = String(prevCount);
        toast(e.message, "error");
      }
    });
    el("editProfileBtn")?.addEventListener("click", () => {
      const f = el("profileEditForm");
      f.name.value = state.me?.name || "";
      f.bio.value = state.me?.bio || "";
      f.avatar.value = state.me?.avatar || "";
      el("profileEditError").textContent = "";
      showDialog(el("profileEditDialog"));
    });
    el("shareProfileBtn")?.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#/profile/${encodeURIComponent(user.username)}`;
      try { await navigator.clipboard?.writeText(url); toast("Profile link copied."); el("shareProfileBtn").textContent = "Copied"; setTimeout(() => { if (el("shareProfileBtn")) el("shareProfileBtn").textContent = "Share"; }, 1500); }
      catch { prompt("Copy profile link:", url); toast("Copy the profile link from the prompt."); }
    });
    el("view-profile").querySelectorAll("[data-ptab]").forEach((b) => b.onclick = () => loadProfile(username, b.dataset.ptab));
  } catch (e) {
    el("view-profile").innerHTML = errorState(e.message || "Failed to load profile.");
  }
}

async function loadSearch(q) {
  if (!String(q || "").trim()) { setView("explore"); return; }
  el("view-search").innerHTML = loadingState("Searching...");
  try {
    const { users = [], posts = [] } = await api(`/api/search?q=${encodeURIComponent(q)}`);
    const usersHtml = users.length
      ? users.map((u) => `<div class="suggestion"><img class="avatar" src="${avatar(u)}" alt="" /><strong>${esc(u.username)}</strong><button data-user="${esc(u.username)}">View</button></div>`).join("")
      : `<div style="padding:8px 0;color:var(--muted)">No users found.</div>`;
    const postsHtml = posts.length
      ? posts.map(postHtml).join("")
      : emptyState("No posts found", `No results for "${esc(q)}". Try a different keyword or hashtag.`);
    el("view-search").innerHTML = `<div class="card" style="padding:14px"><h3>Search: ${esc(q)}</h3><h4>Users</h4>${usersHtml}</div><div class="card" style="padding:14px"><h4 style="margin-top:0">Posts</h4></div>${postsHtml}`;
    el("view-search").querySelectorAll("button[data-user]").forEach((b) => b.onclick = () => loadProfile(b.dataset.user));
    bindPostActions(el("view-search"));
    setView("search", { skipLoad: true });
  } catch (e) { el("view-search").innerHTML = errorState(e.message); setView("search", { skipLoad: true }); }
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
        ${list.map((c) => `<div class="dm-item ${c.user.id === state.dm.userId ? "active" : ""}" data-dm="${c.user.id}"><strong>${esc(c.user.username)}</strong><div style="color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.last?.text || "Start a conversation")}${c.last?.createdAt ? ` · ${timeAgo(c.last.createdAt)}` : ""}</div></div>`).join("") || `<div style="padding:14px;color:var(--muted)">No contacts</div>`}
      </div>
      <div class="dm-chat">
        <div class="dm-head">${active ? esc(active.username) : "Select a conversation"}</div>
        <div class="dm-body">${(thread.messages || []).map((m) => `<div class="dm-msg ${m.from === state.me.id ? "me" : ""}"><div>${esc(m.text)}</div><div class="dm-time">${timeAgo(m.createdAt)}</div></div>`).join("") || `<div style="color:var(--muted)">${active ? "No messages yet. Say hello." : "Choose a contact to start messaging."}</div>`}</div>
        ${active ? `<form class="dm-form" id="dmForm"><input name="text" placeholder="Message..." maxlength="1000" /><button>Send</button></form>` : ``}
      </div>
    </div>`;
    el("view-messages").querySelectorAll("[data-dm]").forEach((n) => n.onclick = () => { state.dm.userId = n.dataset.dm; renderMessages(); });
    el("dmForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = e.currentTarget.querySelector("input[name=text]");
      const text = input.value.trim();
      if (!text || !state.dm.userId) return;
      await api(`/api/messages/${state.dm.userId}`, { method: "POST", body: JSON.stringify({ text }) });
      input.value = "";
      renderMessages();
    });
    const body = el("view-messages").querySelector(".dm-body");
    if (body) body.scrollTop = body.scrollHeight;
  } catch (e) { el("view-messages").innerHTML = errorState(e.message); }
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
    n.addEventListener("click", (e) => {
      const u = n.dataset.profile;
      if (!u) return;
      e.preventDefault();
      e.stopPropagation();
      loadProfile(u);
    });
  });
}

let lastFocus = null;
function showDialog(dialog) {
  if (!dialog) return;
  lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!dialog.open) dialog.showModal();
}
function closeDialog(dialog) {
  if (!dialog?.open) return;
  dialog.close();
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
      } catch (err) { alert(err.message); }
    };
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
  });
}

function bindPostActions(root) {
  bindHashtags(root);
  bindProfileLinks(root);
  bindPostOpen(root);
  root.querySelectorAll(".post").forEach((postEl) => {
    postEl.querySelector(".comment-focus-btn")?.addEventListener("click", () => {
      if (!state.me) return openAuth();
      postEl.querySelector('.comment-form input[name="text"]')?.focus();
    });
    postEl.querySelector(".share-post-btn")?.addEventListener("click", async () => {
      const url = `${location.origin}${location.pathname}#/post/${encodeURIComponent(postEl.dataset.id)}`;
      const btn = postEl.querySelector(".share-post-btn");
      try { await navigator.clipboard?.writeText(url); if (btn) { btn.textContent = "Copied"; setTimeout(() => { if (btn) btn.textContent = "Share"; }, 1500); } toast("Post link copied."); }
      catch { prompt("Copy post link:", url); toast("Copy the post link from the prompt."); }
    });
    postEl.querySelector(".delete-post-btn")?.addEventListener("click", async () => {
      if (!state.me || !confirm("Delete this post?")) return;
      try {
        await api(`/api/posts/${postEl.dataset.id}`, { method: "DELETE" });
        if (state.view === "saved") loadSaved(); else if (state.view === "feed") loadFeed(true); else if (state.view === "profile") loadProfile(state.me.username); else loadFeed(true);
      } catch (e) { alert(e.message); }
    });
    postEl.querySelector(".like-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      const btn = postEl.querySelector(".like-btn");
      const likesEl = postEl.querySelector(".post-likes");
      const prevLiked = btn.classList.contains("liked");
      const prevCount = Number((likesEl.textContent || "0").match(/\d+/)?.[0] || 0);
      const nextLiked = !prevLiked;
      btn.classList.toggle("liked", nextLiked);
      likesEl.textContent = `${Math.max(0, prevCount + (nextLiked ? 1 : -1))} likes`;
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/like`, { method: "POST", body: "{}" });
        btn.classList.toggle("liked", res.liked);
        likesEl.textContent = `${res.likesCount} likes`;
      } catch (e) {
        btn.classList.toggle("liked", prevLiked);
        likesEl.textContent = `${prevCount} likes`;
        alert(e.message);
      }
    });
    postEl.querySelector(".save-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      const btn = postEl.querySelector(".save-btn");
      const prevSaved = btn.classList.contains("saved");
      const nextSaved = !prevSaved;
      btn.classList.toggle("saved", nextSaved);
      btn.textContent = nextSaved ? "Saved" : "Save";
      if (state.view === "saved" && !nextSaved) postEl.style.opacity = "0.45";
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/save`, { method: "POST", body: "{}" });
        btn.classList.toggle("saved", res.saved);
        btn.textContent = res.saved ? "Saved" : "Save";
        postEl.style.opacity = "";
        if (state.view === "saved" && !res.saved) loadSaved();
      } catch (e) {
        btn.classList.toggle("saved", prevSaved);
        btn.textContent = prevSaved ? "Saved" : "Save";
        postEl.style.opacity = "";
        alert(e.message);
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
        try {
          const res = await api(`/api/posts/${postEl.dataset.id}/comments/${commentId}/like`, { method: "POST", body: "{}" });
          btn.classList.toggle("liked", res.liked);
          btn.textContent = `Like ${res.likesCount}`;
        } catch (e) {
          btn.classList.toggle("liked", prevLiked);
          btn.textContent = `Like ${prevCount}`;
          alert(e.message);
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
        } catch (e) { if (node) node.style.opacity = ""; alert(e.message); }
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
        optimistic.outerHTML = `<div class="comment" data-comment-id="${res.comment.id}" data-comment-user="${state.me.id}"><span><strong class="profile-link" data-profile="${esc(state.me.username)}">${esc(state.me.username)}</strong> ${esc(res.comment.text || text)}</span><span class="comment-actions"><button class="comment-like-btn" type="button" aria-label="Like comment">Like ${res.comment.likesCount || 0}</button><button class="comment-delete-btn" type="button" aria-label="Delete comment">Delete</button></span></div>`;
        bindPostActions(postEl);
        refreshNotificationsBadge();
      } catch (err) { optimistic.remove(); input.value = text; alert(err.message); }
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

el("authBtn").onclick = async () => {
  if (state.me) { await api("/api/auth/logout", { method: "POST", body: "{}" }); state.me = null; renderMe(); setView("feed"); }
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
    state.me = user; renderMe(); closeDialog(el("authDialog")); setView("feed");
  } catch (err) { el("authError").textContent = err.message; }
});

document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
el("newPostBtn").onclick = () => { if (!state.me) return openAuth(); el("composer").classList.toggle("hidden"); };
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
el("postFormReset")?.addEventListener("click", () => { el("postForm")?.reset(); updatePostPreview(); el("postFormStatus").textContent = ""; el("postFormStatus").classList.remove("error"); });
el("searchInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.currentTarget.value.trim()) {
    const q = e.currentTarget.value.trim();
    if (state.view === "explore") loadExplore(q); else loadSearch(q);
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
    form.reset(); updatePostPreview();
    status.textContent = "Post shared."; status.classList.remove("error");
    el("composer").classList.add("hidden");
    await loadFeed(true);
  } catch (err) { status.textContent = err.message; status.classList.add("error"); }
  finally { if (submit) { submit.disabled = false; submit.textContent = "Share"; } setTimeout(() => { if (status?.textContent === "Post shared.") status.textContent = ""; }, 2000); }
});
el("storyForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.me) return openAuth();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  const image = String(payload.image || "").trim();
  if (!/^https?:\/\//i.test(image)) { alert("Story image must be a valid http(s) URL."); return; }
  payload.image = image;
  try {
    await api("/api/stories", { method: "POST", body: JSON.stringify(payload) });
    e.currentTarget.reset();
    el("storyCreator").classList.add("hidden");
    await loadStories();
  } catch (err) { alert(err.message); }
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
  } catch (err) { el("profileEditError").textContent = err.message; }
});

function applyTheme() {
  const dark = localStorage.getItem("ig_theme") === "dark";
  document.body.classList.toggle("dark", dark);
  const btn = el("themeBtn");
  if (btn) btn.textContent = dark ? "Light" : "Dark";
}
el("themeBtn")?.addEventListener("click", () => {
  const dark = document.body.classList.toggle("dark");
  localStorage.setItem("ig_theme", dark ? "dark" : "light");
  el("themeBtn").textContent = dark ? "Light" : "Dark";
});
el("postDialogClose")?.addEventListener("click", () => closeDialog(el("postDialog")));
el("postDialog")?.addEventListener("click", (e) => { if (e.target === e.currentTarget) closeDialog(e.currentTarget); });
applyTheme();
setupFeedObserver();

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  ["postDialog", "storyDialog", "authDialog", "profileEditDialog"].forEach((id) => { const d = el(id); if (d?.open) closeDialog(d); });
});

async function handleRoute() {
  const route = routeHash();
  if (!route || route === "feed") return setView("feed", { fromHash: true });
  if (route.startsWith("profile/")) return loadProfile(decodeURIComponent(route.slice("profile/".length)), "posts", { fromRoute: true });
  if (route === "profile") return loadProfile(state.me?.username, "posts", { fromRoute: true });
  if (route.startsWith("post/")) {
    const id = decodeURIComponent(route.slice("post/".length));
    setView("feed", { fromHash: true });
    if (id) try {
      const { post } = await api(`/api/posts/${id}`);
      el("postDialogBody").innerHTML = postHtml(post);
      bindPostActions(el("postDialogBody"));
      showDialog(el("postDialog"));
    } catch (e) { alert(e.message); }
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
