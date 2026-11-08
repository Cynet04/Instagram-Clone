const state = { me: null, view: "feed", authMode: "login", feed: { offset: 0, limit: 5, hasMore: true, loading: false, posts: [], sort: "newest" }, dm: { userId: null }, stories: [], storyIndex: 0 };

const el = (id) => document.getElementById(id);
const views = ["feed", "explore", "notifications", "saved", "messages", "profile", "search", "settings"];
let feedObserver;
const scrollByView = {};

const APP_BUILD = { name: "Socially MVP", phase: "34", date: "2026-11-08" };
function hiddenNotifIds(){ try { return new Set(JSON.parse(localStorage.getItem("ig_hidden_notifs")||"[]")); } catch { return new Set(); } }
function hideNotifId(id){ try { const ids=[...hiddenNotifIds()]; if(!ids.includes(id)) ids.unshift(id); localStorage.setItem("ig_hidden_notifs", JSON.stringify(ids.slice(0,200))); } catch {} }
function shareCount(postId){ try { return Number(JSON.parse(localStorage.getItem("ig_share_counts")||"{}")[postId]||0); } catch { return 0; } }
function bumpShareCount(postId){ try { const m=JSON.parse(localStorage.getItem("ig_share_counts")||"{}"); m[postId]=(Number(m[postId]||0))+1; localStorage.setItem("ig_share_counts",JSON.stringify(m)); } catch {} }

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
        ${mine ? `<button class="archive-post-btn" type="button" title="Archive post" aria-label="Archive post">Archive</button><button class="edit-post-btn" title="Edit caption" aria-label="Edit caption">Edit</button><button class="delete-post-btn" title="Delete post" aria-label="Delete post">Delete</button>` : ""}
      </div>
      <img class="post-image filter-${filter}" src="${esc(p.image)}" alt="${esc(p.altText || `Post by ${p.user?.username || "user"}${p.caption ? `: ${String(p.caption).slice(0, 80)}` : ""}`)}" loading="lazy" decoding="async" title="Open post details" tabindex="0" role="button" aria-label="Open post details by ${esc(p.user?.username || "user")}" onerror="this.onerror=null;this.src='${fallback}'" />
      <div class="post-actions">
        <button class="like-btn ${p.likedByMe ? "liked" : ""}" aria-label="${p.likedByMe ? "Unlike" : "Like"}" aria-pressed="${p.likedByMe ? "true" : "false"}">${p.likedByMe ? "Liked" : "Like"}</button>
        <button class="comment-focus-btn" type="button" aria-label="Comment">Comment</button>
        <button class="copy-caption-btn" type="button" aria-label="Copy post caption">Copy caption</button>
        <button class="copy-image-btn" type="button" aria-label="Copy image link">Copy image</button>
        <button class="open-image-btn" type="button" aria-label="Open image in new tab">Open image</button>
        <button class="share-post-btn" type="button" aria-label="Copy post link" title="Copy post link">Share</button>
        ${!mine ? `<button class="report-post-btn" type="button" aria-label="Report post" title="Report post">Report</button>` : ""}
        <button class="save-btn ${p.savedByMe ? "saved" : ""}" aria-label="${p.savedByMe ? "Remove from saved" : "Save"}" aria-pressed="${p.savedByMe ? "true" : "false"}" style="margin-left:auto">${p.savedByMe ? "Saved" : "Save"}</button>
      </div>
      <div class="post-likes">${p.likesCount} ${p.likesCount===1?"like":"likes"}${mine && typeof p.savesCount === "number" ? ` · ${p.savesCount} ${p.savesCount===1?"save":"saves"}` : ""}${shareCount(p.id)?` · ${shareCount(p.id)} shares`:""}</div>
      <div class="post-caption">${p.location ? `<div class="muted" style="font-size:12px;margin-bottom:2px">📍 ${esc(p.location)}</div>` : ""}<strong class="profile-link" data-profile="${esc(p.user?.username || "")}">${esc(p.user?.username || "")}</strong> <span class="caption-text">${formatCaption(p.caption || "")}</span></div>
      ${(p.comments||[]).length>1?`<div style="margin:0 14px 6px"><label class="muted" style="font-size:12px">Sort comments <select class="comment-sort" data-post-id="${esc(p.id)}" style="margin-left:6px;background:var(--input);color:var(--text);border:1px solid var(--line);border-radius:6px;padding:2px 6px"><option value="top">Top</option><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label></div>`:""}
      <div class="comments" data-comment-sort="top">${(() => { const pins=new Set(pinnedCommentIds(p.id)); const arr=[...(p.comments||[])]; arr.sort((a,b)=> (pins.has(b.id)-pins.has(a.id)) || (b.likesCount||0)-(a.likesCount||0) || (b.createdAt||0)-(a.createdAt||0)); return arr.map((c) => { const pinned=pins.has(c.id);
        const canDelete = state.me && (c.user?.id === state.me.id || mine);
        return `
        <div class="comment ${pinned?"comment-pinned":""}" data-comment-id="${c.id}" data-comment-user="${c.user?.id || ""}" style="${pinned?"background:var(--hover,rgba(0,0,0,.04));border-radius:8px;padding:4px 6px":""}">
          <span>${pinned?`<strong class="muted" style="font-size:11px;margin-right:6px">Pinned</strong>`:""}<strong class="profile-link" data-profile="${esc(c.user?.username || "")}">${esc(c.user?.username || "user")}</strong> ${esc(c.text)}</span>
          <span class="comment-actions">
            <button class="comment-like-btn ${c.likedByMe ? "liked" : ""}" type="button" aria-label="${c.likedByMe ? "Unlike comment" : "Like comment"}" aria-pressed="${c.likedByMe ? "true" : "false"}">Like ${c.likesCount || 0}</button>
            ${state.me && c.user?.id === state.me.id ? `<button class="comment-edit-btn" type="button" aria-label="Edit comment">Edit</button>` : ""}${!state.me || c.user?.id !== state.me.id ? `<button class="comment-report-btn" type="button" aria-label="Report comment">Report</button>` : ""}${canDelete ? `<button class="comment-delete-btn" type="button" aria-label="Delete comment">Delete</button>` : ""}
          </span>
        </div>`; }).join(""); })()}</div>
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
  el("storyMeta").innerHTML = `<span>${esc(s.user?.username || "story")} · ${timeAgo(s.createdAt)}</span><span style="display:inline-flex;gap:6px;margin-left:10px">${["❤️","🔥","👏","😂"].map((r)=>`<button type="button" class="mini-btn secondary story-react-btn" data-react="${r}" aria-label="React ${r}" style="padding:2px 8px">${r}</button>`).join("")}</span>`;
  el("storyMeta").querySelectorAll(".story-react-btn").forEach((b)=>b.onclick=(e)=>{ e.stopPropagation(); toast(`${b.dataset.react} reaction sent to @${s.user?.username || "user"} (local MVP).`); });
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

function renderFeedPosts(posts = []) {
  const root = el("view-feed"); if (!root) return;
  root.innerHTML = (posts.length ? posts.map(postHtml).join("") : emptyState("No posts yet", "When people share photos, they'll appear here."));
  bindPostActions(root);
  if (!state.feed.hasMore && posts.length) root.insertAdjacentHTML("beforeend", `<div class="feed-status" role="status">You're all caught up.</div>`);
}
function applyFeedSort() {
  const sort = state.feed.sort || "newest";
  const archived = state.me ? new Set(archivedPostIds(state.me.username)) : new Set();
  const posts = [...(state.feed.posts || [])].filter((p)=>!archived.has(p.id)).sort((a,b)=> sort==="liked" ? ((b.likesCount||0)-(a.likesCount||0)) || ((b.createdAt||0)-(a.createdAt||0)) : ((b.createdAt||0)-(a.createdAt||0)));
  const header = `<div class="card" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div style="display:flex;align-items:center;gap:10px"><h3 style="margin:0">Feed</h3><button id="feedRefreshBtn" type="button" class="mini-btn secondary" aria-label="Refresh feed">Refresh</button></div><label class="muted" style="font-size:13px;display:flex;align-items:center;gap:8px">Sort posts <select id="feedSort" aria-label="Sort feed posts" aria-label="Sort feed"><option value="newest" ${state.feed.sort==="newest"?"selected":""}>Newest</option><option value="liked" ${state.feed.sort==="liked"?"selected":""}>Most liked</option></select></label></div>`;
  const root = el("view-feed"); if (!root) return;
  root.innerHTML = header + (posts.length ? posts.map(postHtml).join("") : emptyState("No posts yet", "When people share photos, they'll appear here.").replace('<div class="card state-card">','<div class="state-card" style="margin:16px">'));
  bindPostActions(root);
  if (!state.feed.hasMore && posts.length) root.insertAdjacentHTML("beforeend", `<div class="feed-status" role="status">You're all caught up.</div>`);
  el("feedSort")?.addEventListener("change", (e)=>{ state.feed.sort = e.target.value; applyFeedSort(); });
  el("feedRefreshBtn")?.addEventListener("click", ()=>{ loadFeed(true); toast("Feed refreshed."); });
}
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
    const recent = recentSearches();
    const chips = !query && recent.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${recent.slice(0,6).map((r)=>`<button type="button" class="mini-btn secondary" data-explore-chip="${esc(r)}">${esc(r)}</button>`).join("")}</div>` : "";
    el("view-explore").innerHTML = `<div class="card" style="padding:14px">
      ${chips}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">
        <h3 style="margin:0">Explore ${query ? `: ${esc(query)}` : ""}</h3>
        ${query ? `<button id="clearExplore" class="mini-btn secondary" type="button" aria-label="Clear explore search">Clear</button>` : ""}
      </div>
      <div class="explore-grid">${posts.map((p) => `<img class="filter-${esc(p.filter || "none")}" src="${esc(p.image)}" alt="Explore post by ${esc(p.user?.username || "user")}" loading="lazy" decoding="async" data-post-id="${p.id}" title="Open post by ${esc(p.user?.username || "")}" tabindex="0" role="button" aria-label="Open post by ${esc(p.user?.username || "user")}" onerror="this.style.opacity='0.35'" />`).join("") || ""}</div>
      ${posts.length ? "" : emptyState("No posts found", query ? "Try a different search." : "Posts will appear here.")}
    </div>`;
    bindPostOpen(el("view-explore"));
    el("exploreLoginBtn")?.addEventListener("click", openAuth);
    el("exploreEmptyLoginBtn")?.addEventListener("click", openAuth);
    el("clearExplore")?.addEventListener("click", () => { el("searchInput").value = ""; loadExplore(""); });
    el("view-explore").querySelectorAll("[data-explore-chip]").forEach((b)=>b.addEventListener("click",()=>{ el("searchInput").value=b.dataset.exploreChip; loadExplore(b.dataset.exploreChip); }));
  } catch (e) { el("view-explore").innerHTML = errorState(e.message, "explore"); }
}

async function loadSaved(q = "") {
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
    const hidden = hiddenNotifIds();
    const visible = notifications.filter((n)=>!hidden.has(n.id));
    el("view-notifications").innerHTML = `<div class="card"><div style="padding:14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Notifications${unread?` (${unread} unread)`:""}</h3><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end"><label class="muted" style="font-size:12px;display:flex;align-items:center;gap:4px"><input type="checkbox" id="hideReadNotifs" ${localStorage.getItem("ig_hide_read_notifs")==="true"?"checked":""}/> Hide read</label><button id="clearNotifBtn" type="button" aria-label="Clear notifications" ${visible.length?"":"disabled"} style="border:0;background:none;color:var(--muted);font-weight:600;opacity:${visible.length?1:.5}">Clear</button><button id="markReadBtn" type="button" aria-label="Mark all notifications as read" ${unread? "":"disabled"} style="border:0;background:none;color:${unread?"var(--blue)":"var(--muted)"};font-weight:600;opacity:${unread?1:.6}">Mark read</button></div></div>` +
      (visible.length ? visible.map((n) => {
        const actor = esc(n.actor?.username || "Someone");
        const msg = n.type === "like" ? "liked your post" : n.type === "comment" ? `commented: ${esc(n.text || "")}` : n.type === "comment_like" ? "liked your comment" : n.type === "follow" ? "started following you" : "interacted with you";
        const postId = n.post?.id || "";
        const profile = n.actor?.username || "";
        const followBtn = n.type === "follow" && state.me && profile && state.me.username !== profile
          ? `<button type="button" class="mini-btn ${n.actor?.isFollowing ? "secondary" : ""}" data-follow-user="${esc(profile)}" style="margin-left:auto;padding:4px 8px;font-size:12px" aria-label="${n.actor?.isFollowing ? "Unfollow" : "Follow"} ${esc(profile)}">${n.actor?.isFollowing ? "Following" : "Follow"}</button>`
          : "";
        return `<div class="notif notif-link ${n.read ? "" : "unread"}" data-notif-id="${esc(n.id || "")}" data-notif-post="${esc(postId)}" data-notif-profile="${esc(profile)}" data-notif-type="${esc(n.type || "")}" tabindex="0" role="button" aria-label="${esc(actor)} ${esc(msg.replace(/<[^>]+>/g, ""))}"><img class="avatar" src="${avatar(n.actor)}" alt="" style="width:34px;height:34px" /><span class="notif-text" style="flex:1"><strong>${actor}</strong> ${msg}<span class="notif-time">${timeAgo(n.createdAt)}</span></span>${followBtn}<button type="button" class="notif-hide-btn mini-btn secondary" data-hide-notif="${esc(n.id||"")}" aria-label="Hide notification" style="padding:2px 6px;font-size:11px">Hide</button></div>`;
      }).join("") : `<div style="padding:16px">${emptyState("All caught up", "No visible notifications with current filters.").replace('<div class="card state-card">','<div class="state-card" style="border:0">')}</div>`) + `</div>`;
    el("markReadBtn")?.addEventListener("click", async () => {
      updateBadge(0); const btn=el("markReadBtn"); if(btn){ btn.disabled=true; btn.style.opacity=".6"; btn.style.color="var(--muted)"; } el("view-notifications").querySelectorAll(".notif.unread").forEach((n)=>n.classList.remove("unread"));
      try {
        const res = await api("/api/notifications/read", { method: "POST", body: "{}" });
        updateBadge(res.unread ?? 0);
        toast("Notifications marked as read.");
        loadNotifications();
      } catch (e) { toast(e.message, "error"); loadNotifications(); }
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

async function refreshDmBadge() {
  const badge = el("dmBadge"); if (!badge) return;
  if (!state.me) { badge.classList.add("hidden"); badge.textContent = "0"; return; }
  try {
    const res = await api("/api/messages/conversations");
    const n = Number(res.unread || 0);
    badge.textContent = String(n);
    badge.classList.toggle("hidden", n <= 0);
  } catch {}
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
    const profileView = localStorage.getItem("ig_profile_view") || "grid";
    const gridPosts = tab === "saved" ? savedPosts : posts;
    el("view-profile").innerHTML = `
      <div class="card">
        <div class="profile-head">
          <img id="profileAvatarPreview" class="avatar" src="${avatar(user)}" alt="${esc(user.username)} avatar" tabindex="0" role="button" aria-label="Preview profile photo for ${esc(user.username)}" onerror="this.onerror=null;this.src='https://placehold.co/192x192/f5f5f5/737373?text=User'" style="cursor:pointer" />
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <h2 style="margin:0">${esc(user.username)}${state.me?.id===user.id?` <span class="muted" style="font-size:12px;font-weight:600">(you)</span>`:""}</h2>
              ${state.me && !isMe ? `<button id="followBtn" class="mini-btn ${isFollowing ? "secondary" : ""}" aria-label="${isFollowing ? "Unfollow" : "Follow"} ${esc(user.username)}">${isFollowing ? "Following" : "Follow"}</button><button id="messageBtn" class="mini-btn secondary" aria-label="Message ${esc(user.username)}">Message</button><button id="blockBtn" class="mini-btn secondary" aria-label="Block ${esc(user.username)}">Block</button>` : ""}
              ${isMe ? `<button id="editProfileBtn" class="mini-btn secondary" aria-label="Edit your profile">Edit profile</button>` : ""}
              <button id="shareProfileBtn" class="mini-btn secondary" title="Copy profile link" aria-label="Share profile for ${esc(user.username)}">Share</button>
              <button id="copyUsernameBtn" class="mini-btn secondary" type="button" aria-label="Copy username">Copy @</button>
              <button id="copyProfileCardBtn" class="mini-btn secondary" type="button" aria-label="Copy profile card">Copy card</button>
            </div>
            <div style="display:flex;gap:16px;margin:8px 0"><span><strong>${posts.length}</strong> posts</span><button type="button" class="link-btn" id="showFollowersBtn" style="border:0;background:none;padding:0;font:inherit;cursor:pointer"><strong id="followersCount">${followers}</strong> followers</button><button type="button" class="link-btn" id="showFollowingBtn" style="border:0;background:none;padding:0;font:inherit;cursor:pointer"><strong>${following}</strong> following</button></div>
            <div><strong>${esc(user.name || "")}</strong></div>
            <div style="white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere">${(user.bio||"").split(/(https?:\/\/[^\s]+)/g).map((part)=>/^https?:\/\//.test(part)?`<a href="${esc(part)}" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">${esc(part.replace(/^https?:\/\//,""))}</a>`:esc(part)).join("")}</div>${user.createdAt?`<div class="muted" style="margin-top:4px;font-size:12px">Joined ${new Date(user.createdAt).toLocaleDateString()}</div>`:`<div class="muted" style="margin-top:4px;font-size:12px">Joined recently</div>`}
            ${user.website ? `<div><a href="${esc(user.website)}" target="_blank" rel="noopener noreferrer" style="color:var(--blue);text-decoration:none">${esc(user.website.replace(/^https?:\/\//,""))}</a></div>` : ""}
            ${state.me && !isMe ? `<div id="profileNoteWrap" style="margin-top:10px"><label class="muted" style="font-size:12px;display:block;margin-bottom:4px">Private note (only you can see)</label><textarea id="profilePrivateNote" rows="2" maxlength="500" placeholder="Add a note about @${esc(user.username)}" style="width:100%;resize:vertical;background:var(--input);color:var(--text);border:1px solid var(--line);border-radius:8px;padding:8px">${esc(getProfileNote(state.me.id,user.id))}</textarea><div style="margin-top:6px"><button type="button" id="saveProfileNoteBtn" class="mini-btn secondary">Save note</button></div></div>` : ""}
          </div>
        </div>
        ${isMe ? `<div class="profile-tabs" role="tablist" aria-label="Profile sections" style="display:flex;justify-content:space-between;align-items:center"><span><button type="button" role="tab" aria-selected="${tab === "posts" ? "true" : "false"}" data-ptab="posts" class="${tab === "posts" ? "active" : ""}">Posts</button><button type="button" role="tab" aria-selected="${tab === "saved" ? "true" : "false"}" data-ptab="saved" class="${tab === "saved" ? "active" : ""}">Saved</button></span><button type="button" id="profileViewToggle" class="mini-btn secondary" style="margin:8px">${profileView==="grid"?"List":"Grid"}</button></div>` : `<div style="padding:8px;text-align:right"><button type="button" id="profileViewToggle" class="mini-btn secondary">${profileView==="grid"?"List":"Grid"}</button></div>`}
      </div>
      <div class="card" style="padding:4px"><div class="grid">${(() => { const pins=isMe?new Set(pinnedPostIds(user.username)):new Set(); const sorted=[...gridPosts].sort((a,b)=>(pins.has(b.id)-pins.has(a.id))||(b.createdAt-a.createdAt)); return sorted.map((p)=>`<div style="position:relative"><img class="filter-${esc(p.filter||"none")}" src="${esc(p.image)}" alt="Post by ${esc(user.username)}" loading="lazy" decoding="async" data-post-id="${p.id}" title="Open post details" tabindex="0" role="button" aria-label="Open post details" onerror="this.style.opacity='0.35'" style="width:100%;display:block" />${pins.has(p.id)?`<span style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,.65);color:#fff;font-size:11px;padding:2px 6px;border-radius:999px">Pinned</span>`:""}${isMe && tab!=="saved"?`<button type="button" class="mini-btn secondary pin-post-btn" data-post-id="${p.id}" style="position:absolute;right:6px;bottom:6px;padding:2px 6px;font-size:11px">${pins.has(p.id)?"Unpin":"Pin"}</button>`:""}</div>`).join("") || `<div style="grid-column:1/-1;padding:8px">${emptyState(tab === "saved" ? "No saved posts" : "No posts yet", tab === "saved" ? "Posts you save will appear here." : isMe ? "Share your first photo to get started." : "This user hasn't posted yet.").replace('<div class="card state-card">','<div class="state-card" style="border:0;min-height:180px">')}</div>`; })()}</div></div>`;
    const openAvatar = () => { el("avatarDialogImage").src = avatar(user).replace(/&amp;/g,'&'); el("avatarDialogMeta").textContent = `@${user.username}`; showDialog(el("avatarDialog")); el("avatarDialogClose")?.focus?.(); };
    el("profileAvatarPreview")?.addEventListener("click", openAvatar);
    el("profileAvatarPreview")?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAvatar(); } });
    el("view-profile").querySelectorAll(".pin-post-btn").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = b.dataset.postId; const ids = pinnedPostIds(user.username);
      const next = ids.includes(id) ? ids.filter((x)=>x!==id) : [id, ...ids].slice(0,3);
      setPinnedPostIds(user.username, next); toast(ids.includes(id) ? "Post unpinned." : "Post pinned to profile."); loadProfile(user.username, tab);
    }));
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
        refreshNotificationsBadge(); refreshDmBadge();
      } catch (e) {
        btn.classList.toggle("secondary", prevFollowing);
        btn.textContent = prevFollowing ? "Following" : "Follow";
        btn.setAttribute("aria-label", `${prevFollowing ? "Unfollow" : "Follow"} ${user.username}`);
        if (count) count.textContent = String(prevCount);
        toast(e.message, "error");
      } finally { btn.disabled = false; }
    });
    el("messageBtn")?.addEventListener("click", () => openDmWith(user.id));
    el("blockBtn")?.addEventListener("click", async () => {
      const btn = el("blockBtn"); if (!btn) return;
      try { btn.disabled = true; const res = await api(`/api/users/${encodeURIComponent(user.username)}/block`, { method: "POST", body: "{}" }); toast(res.blocked ? `Blocked @${user.username}.` : `Unblocked @${user.username}.`); btn.textContent = res.blocked ? "Unblock" : "Block"; if (res.blocked) { setView("feed"); loadFeed(true); } else loadProfile(user.username); }
      catch (e) { toast(e.message, "error"); } finally { btn.disabled = false; }
    });
    el("editProfileBtn")?.addEventListener("click", () => {
      const f = el("profileEditForm");
      f.name.value = state.me?.name || "";
      f.bio.value = state.me?.bio || "";
      f.avatar.value = state.me?.avatar || "";
      el("profileEditError").textContent = "";
      showDialog(el("profileEditDialog"));
    });
  el("copyUsernameBtn")?.addEventListener("click", async () => {
    try { await navigator.clipboard?.writeText(`@${user.username}`); toast("Username copied."); } catch { prompt("Username:", `@${user.username}`); }
  });
  el("copyProfileCardBtn")?.addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}#/profile/${encodeURIComponent(user.username)}`;
    const text = [`@${user.username}`, user.name||"", user.bio||"", user.website||"", `${posts.length} posts · ${followers} followers · ${following} following`, url].filter(Boolean).join("\n");
    try { await navigator.clipboard?.writeText(text); toast("Profile card copied."); } catch { prompt("Profile card:", text); }
  });
  el("saveProfileNoteBtn")?.addEventListener("click", () => { if(!state.me) return; setProfileNote(state.me.id, user.id, el("profilePrivateNote")?.value||""); toast("Private note saved."); });
  el("copyBioBtn")?.addEventListener("click", async () => { try { await navigator.clipboard?.writeText(user.bio||""); toast(user.bio ? "Bio copied." : "No bio to copy."); } catch { toast("Could not copy bio."); } });
  el("copyUsernameBtn")?.addEventListener("click", async () => { try { await navigator.clipboard?.writeText("@"+user.username); toast("Username copied."); } catch { toast("Could not copy username."); } });
  el("shareProfileBtn")?.addEventListener("click", async () => {
    const btn = el("shareProfileBtn");
    const url = `${location.origin}${location.pathname}#/profile/${encodeURIComponent(user.username)}`;
    try {
      const shareData = { title: `Instagram Clone � @${postEl.querySelector(".post-user")?.textContent || "post"}`, text: (postEl.querySelector(".caption-text")?.textContent || "").trim().slice(0, 160) || "Check out this post", url };
        if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
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

function notifSoundPref(){ try { return localStorage.getItem("ig_notif_sound")==="true"; } catch { return false; } }
function setNotifSoundPref(v){ localStorage.setItem("ig_notif_sound", String(!!v)); }
function activityStatusEnabled(){ try { const v=localStorage.getItem("ig_activity_status"); return v===null?true:v==="true"; } catch { return true; } }
function setActivityStatusEnabled(v){ localStorage.setItem("ig_activity_status", String(!!v)); }
function loadNotifPrefs(){ try { return { like:true, comment:true, follow:true, comment_like:true, ...(JSON.parse(localStorage.getItem("ig_notif_prefs")||"{}")) }; } catch { return { like:true, comment:true, follow:true, comment_like:true }; } }
function saveNotifPrefs(p){ localStorage.setItem("ig_notif_prefs", JSON.stringify(p)); }
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
        refreshNotificationsBadge(); refreshDmBadge();
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
        <h4 style="margin:0 0 8px">Privacy & preferences (local)</h4>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin-bottom:8px"><input type="checkbox" id="activityStatusPref" ${activityStatusEnabled()?"checked":""}/> Show activity status (local indicator)</label>
        <label style="display:flex;gap:8px;align-items:center;font-size:14px;margin-bottom:8px"><input type="checkbox" id="notifSoundPref" ${notifSoundPref()?"checked":""}/> Notification feedback (visual pulse, local)</label>
        <h5 style="margin:8px 0">Notification preferences</h5>
        <div id="notifPrefs" style="display:grid;gap:6px;font-size:14px">
          ${[["like","Likes"],["comment","Comments"],["follow","Follows"],["comment_like","Comment likes"]].map(([k,l])=>`<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-notif-pref="${k}" ${loadNotifPrefs()[k]!==false?"checked":""}/> ${l}</label>`).join("")}
        </div>
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
        <h4 style="margin:0 0 8px">Local data / diagnostics</h4>
        <div class="card" style="padding:12px;margin-bottom:12px"><strong>@${esc(state.me.username)}</strong><div class="muted" style="font-size:13px">${esc(state.me.name||"")}${state.me.bio?` · ${esc(String(state.me.bio).slice(0,60))}`:""}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button id="checkServerBtn" type="button" class="mini-btn secondary">Check server</button><button id="reloadPageBtn" type="button" class="mini-btn secondary">Reload page</button><a href="/api/health" target="_blank" rel="noopener noreferrer" class="mini-btn secondary" style="text-decoration:none">Open /api/health</a><button id="copyDiagBtn" type="button" class="mini-btn secondary">Copy diagnostics</button><button id="copyBuildBtn" type="button" class="mini-btn secondary">Copy build info</button><button id="refreshSwBtn" type="button" class="mini-btn secondary">Refresh SW status</button><button id="exportDataBtn" type="button" class="mini-btn secondary">Export my data</button><button id="clearLocalPrefsBtn" type="button" class="mini-btn secondary">Clear local prefs</button><button id="clearSearchHistoryBtn" type="button" class="mini-btn secondary">Clear search history</button><button id="clearHiddenNotifsBtn" type="button" class="mini-btn secondary">Clear hidden notifications</button><button id="resetLocalIgBtn" type="button" class="mini-btn secondary">Reset local IG prefs</button></div>
        <div class="muted" style="font-size:13px;line-height:1.5">Socially MVP (local) · Node/Express + vanilla SPA · JSON data store.<br/>Theme/recent searches stored in localStorage. Runtime data/uploads are local and not exported by this client.</div>
      </section>
      <section>
        <h4 style="margin:0 0 8px">My reports (local MVP)</h4>
        <div id="myReportsList" class="muted" style="font-size:13px">Loading reports...</div>
      </section>
    </div>`;
  bindProfileLinks(root);
  try {
    const { reports = [] } = await api("/api/me/reports");
    el("myReportsList").innerHTML = reports.length ? reports.map((r) => `<div class="notif" style="align-items:center"><div style="flex:1"><strong>${esc(r.type)}</strong> ${esc(r.reason || "")} ${r.target?.user?.username ? `· @${esc(r.target.user.username)}` : ""}<div style="color:var(--muted);font-size:12px">${timeAgo(r.createdAt)} · ${esc(r.status || "open")}</div></div>${r.target?.id ? `<button type="button" class="mini-btn secondary" data-post-id="${esc(r.target.id)}">Open image</button>` : ""}</div>`).join("") : "No reports submitted.";
    bindPostOpen(el("myReportsList"));
  } catch (e) { el("myReportsList").textContent = e.message || "Could not load reports."; }
  root.querySelector("#settingsThemeBtn")?.addEventListener("click", () => el("themeBtn")?.click());
  root.querySelector("#settingsLogoutBtn")?.addEventListener("click", () => el("authBtn")?.click());
  root.querySelector("#checkServerBtn")?.addEventListener("click", async () => { await refreshHealth(); toast("Server status refreshed."); });
  root.querySelector("#reloadPageBtn")?.addEventListener("click", () => location.reload());
  if("serviceWorker" in navigator){ navigator.serviceWorker.getRegistration().then((r)=>{ const s=el("swStatus"); if(s) s.textContent=`Service worker: ${r?"registered":"not registered"}`; }).catch(()=>{}); }
  root.querySelector("#copyBuildBtn")?.addEventListener("click", async () => { try { await navigator.clipboard?.writeText(JSON.stringify(APP_BUILD)); toast("Build info copied."); } catch { toast("Could not copy build info."); } });
  root.querySelector("#refreshSwBtn")?.addEventListener("click", async ()=>{ if(!("serviceWorker" in navigator)) return toast("Service worker unsupported."); const r=await navigator.serviceWorker.getRegistration().catch(()=>null); const s=el("swStatus"); if(s) s.textContent=`Service worker: ${r?"registered":"not registered"}`; toast("Service worker status refreshed."); });
  root.querySelector("#copyDiagBtn")?.addEventListener("click", async () => {
    const text = JSON.stringify({ app: "Socially MVP", build: APP_BUILD, origin: location.origin, user: state.me?.username || null, view: state.view, theme: document.body.classList.contains("dark") ? "dark" : "light", recentSearches: recentSearches(), time: new Date().toISOString() }, null, 2);
    try { await navigator.clipboard?.writeText(text); toast("Diagnostics copied."); } catch { prompt("Diagnostics:", text); }
  });
  root.querySelector("#exportDataBtn")?.addEventListener("click", async (e) => {
    const b=e.currentTarget; if(b.disabled) return; b.disabled=true; b.textContent="Exporting...";
    try {
      const data = await api("/api/me/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `socially-export-${state.me?.username || "user"}.json`; a.click();
      URL.revokeObjectURL(url); toast("Data export downloaded.");
    } catch (e) { toast(e.message, "error"); }
  });
  root.querySelector("#clearLocalPrefsBtn")?.addEventListener("click", () => { localStorage.removeItem("ig_theme"); localStorage.removeItem("ig_recent_searches"); localStorage.removeItem("ig_notif_prefs"); localStorage.removeItem("ig_post_draft"); applyTheme(); toast("Local preferences cleared."); });
  root.querySelector("#clearSearchHistoryBtn")?.addEventListener("click", () => { localStorage.removeItem("ig_recent_searches"); toast("Search history cleared."); });
  root.querySelector("#clearHiddenNotifsBtn")?.addEventListener("click", () => { localStorage.removeItem("ig_hidden_notifs"); toast("Hidden notifications cleared."); });
  root.querySelector("#resetLocalIgBtn")?.addEventListener("click", () => { if(!confirm("Reset all local Instagram Clone preferences/state?")) return; Object.keys(localStorage).filter((k)=>k.startsWith("ig_")).forEach((k)=>localStorage.removeItem(k)); applyTheme(); toast("Local IG preferences reset."); renderSettings(); });
  root.querySelector("#activityStatusPref")?.addEventListener("change", (e)=>{ setActivityStatusEnabled(e.target.checked); toast(e.target.checked?"Activity status enabled (local).":"Activity status hidden (local)."); renderMessages(); });
  root.querySelector("#notifSoundPref")?.addEventListener("change", (e)=>{ setNotifSoundPref(e.target.checked); toast(e.target.checked?"Notification feedback enabled.":"Notification feedback disabled."); });
  root.querySelectorAll("[data-notif-pref]").forEach((cb) => cb.addEventListener("change", () => { const prefs = loadNotifPrefs(); prefs[cb.dataset.notifPref] = cb.checked; saveNotifPrefs(prefs); toast("Notification preferences saved."); }));
  root.querySelector("#showShortcutsBtn")?.addEventListener("click", () => showDialog(el("shortcutsDialog")));
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
    const convRes = await api("/api/messages/conversations");
    const { conversations, contacts, unread = 0 } = convRes;
    const dmBadge = el("dmBadge"); if (dmBadge) { dmBadge.textContent = String(unread); dmBadge.classList.toggle("hidden", Number(unread) <= 0); }
    const list = [...conversations];
    for (const c of contacts || []) if (!list.some((x) => x.user?.id === c.id)) list.push({ user: c, last: null });
    if (!state.dm.userId && list[0]?.user?.id) state.dm.userId = list[0].user.id;
    const active = list.find((x) => x.user?.id === state.dm.userId)?.user || null;
    const thread = active ? await api(`/api/messages/${active.id}`) : { messages: [] };
    el("view-messages").innerHTML = `<div class="card dm">
      <div class="dm-list">
        <div style="padding:12px 14px;border-bottom:1px solid var(--line);font-weight:600">Messages</div>
        ${list.map((c) => `<div class="dm-item ${c.user.id === state.dm.userId ? "active" : ""}" data-dm="${c.user.id}" tabindex="0" role="button" ${c.user.id === state.dm.userId ? 'aria-current="true" aria-selected="true"' : ""} aria-label="Open conversation with ${esc(c.user.username)}"><strong>${esc(c.user.username)}</strong><div style="color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.last?.text || "Start a conversation")}${c.last?.createdAt ? ` � ${timeAgo(c.last.createdAt)}` : ""}</div></div>`).join("") || `<div style="padding:14px;color:var(--muted)">No contacts</div>`}
      </div>
      <div class="dm-chat">
        <div class="dm-head" style="display:flex;justify-content:space-between;align-items:center;gap:8px">${active ? `<div><button type="button" class="profile-link" data-profile="${esc(active.username)}" style="border:0;background:none;padding:0;font:inherit;font-weight:600;color:inherit;cursor:pointer">${esc(active.username)}</button>${activityStatusEnabled() ? `<div class="muted" style="font-size:12px;font-weight:400">Active now</div>` : ``}${isDmMuted(active.id) ? `<div class="muted" style="font-size:12px;font-weight:400">Muted</div>` : ``}</div><div style="display:flex;gap:6px"><button id="muteDmBtn" type="button" class="mini-btn secondary">${isDmMuted(active.id)?"Unmute":"Mute"}</button><button id="clearDmBtn" type="button" class="mini-btn secondary">Clear</button></div>` : "Select a conversation"}</div>
        <div class="dm-body" aria-live="polite">${mutedActive ? `<div style="color:var(--muted)">Messages hidden for this muted conversation. Unmute to view.</div>` : ((thread.messages || []).length ? (thread.messages || []).map((m,i,arr) => { const mine=m.from===state.me.id; const isLastMine=mine && arr.slice(i+1).every(x=>x.from!==state.me.id); return `<div class="dm-msg ${mine ? "me" : ""}" data-msg-id="${esc(m.id || "")}"><div>${esc(m.text)}</div><div class="dm-time">${timeAgo(m.createdAt)}${isLastMine ? ` · Seen` : ""}${mine && m.id ? ` <button type="button" class="del-msg-btn" data-msg-id="${esc(m.id)}" style="border:0;background:none;color:inherit;cursor:pointer;padding:0;margin-left:6px">Delete</button>` : ""}</div></div>`; }).join("") : (active ? `<div><div style="color:var(--muted);margin-bottom:10px">No messages yet. Say hello.</div><div style="display:flex;gap:8px;flex-wrap:wrap">${["Hey! 👋","How are you?","Nice post!"].map((t)=>`<button type="button" class="mini-btn secondary dm-quick-reply" data-text="${esc(t)}">${esc(t)}</button>`).join("")}</div></div>` : `<div style="color:var(--muted)">Choose a contact to start messaging.</div>`))}</div>
        ${active ? `<div class="quick-emoji muted" style="padding:0 14px 8px;display:flex;gap:6px;flex-wrap:wrap">${["❤️","😂","👍","🔥","👋"].map((e)=>`<button type="button" class="mini-btn secondary dm-emoji-btn" data-emoji="${e}" style="padding:2px 8px">${e}</button>`).join("")}</div><div id="dmTyping" class="form-status" aria-live="polite" style="padding:0 14px"></div><form class="dm-form" id="dmForm"><input name="text" placeholder="Message..." maxlength="1000" autocomplete="off" aria-label="Message to ${esc(active.username)}" /><button type="submit" aria-label="Send message">Send</button></form>` : ``}
      </div>
    </div>`;
    el("view-messages").querySelectorAll("[data-dm]").forEach((n) => {
      const open = () => { state.dm.userId = n.dataset.dm; renderMessages(); };
      n.onclick = open;
      n.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    bindProfileLinks(el("view-messages"));
    el("view-messages").querySelectorAll(".dm-quick-reply").forEach((b)=>b.addEventListener("click",()=>{ const i=el("dmForm")?.querySelector("input[name=text]"); if(i){ i.value=b.dataset.text||""; i.focus(); } }));
    el("view-messages").querySelectorAll(".del-msg-btn").forEach((b) => b.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = b.dataset.msgId; if (!id || !state.dm.userId) return;
      try { await api(`/api/messages/${state.dm.userId}/${id}`, { method: "DELETE" }); b.closest(".dm-msg")?.remove(); toast("Message deleted."); }
      catch (err) { toast(err.message, "error"); }
    }));
    el("muteDmBtn")?.addEventListener("click", () => {
      if (!state.dm.userId) return; const ids = mutedDmUsers(); const muted = ids.includes(state.dm.userId);
      setMutedDmUsers(muted ? ids.filter((x)=>x!==state.dm.userId) : [...ids, state.dm.userId]); toast(muted ? "Conversation unmuted." : "Conversation muted locally."); renderMessages();
    });
    el("clearDmBtn")?.addEventListener("click", async () => {
      if (!state.dm.userId || !confirm("Clear this conversation?")) return;
      try { await api(`/api/messages/${state.dm.userId}`, { method: "DELETE" }); toast("Conversation cleared."); renderMessages(); refreshDmBadge(); }
      catch (e) { toast(e.message, "error"); }
    });
    const dmInput = el("dmForm")?.querySelector("input[name=text]");
    el("view-messages").querySelectorAll(".dm-emoji-btn").forEach((b)=>b.addEventListener("click",()=>{ if(dmInput){ dmInput.value = (dmInput.value ? dmInput.value + " " : "") + b.dataset.emoji; dmInput.dispatchEvent(new Event("input")); dmInput.focus(); } }));
    let typingTimer;
    dmInput?.addEventListener("input", () => { const t = el("dmTyping"); if (!t) return; t.textContent = dmInput.value.trim() ? `${active?.username || "User"} may be typing...` : ""; clearTimeout(typingTimer); typingTimer = setTimeout(()=>{ if(t) t.textContent=""; }, 1200); });
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
        if (el("dmTyping")) el("dmTyping").textContent = "";
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
      finally { const b=el("dmForm")?.querySelector("button[type=submit]"); if(b){ b.disabled=false; b.textContent="Send"; } }
    };
    img.addEventListener("click", open);
    img.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(e); } });
  });
}

function bindHashtagLinks(root){
  root.querySelectorAll(".hashtag-link").forEach((a)=>a.addEventListener("click",(e)=>{ e.preventDefault(); const tag=a.dataset.hashtag; if(!tag) return; closeDialog(el("postDialog")); setView("explore"); const si=el("searchInput"); if(si){ si.value="#"+tag; localStorage.setItem("ig_last_search", si.value); } setTimeout(()=>loadExplore("#"+tag), 0); }));
}
function bindPostActions(root) {
  if (!root) return;
  bindHashtags(root);
  bindProfileLinks(root);
  bindPostOpen(root);
  const posts = root.classList?.contains("post") ? [root] : Array.from(root.querySelectorAll(".post"));
  posts.forEach((postEl) => {
    postEl.querySelector(".archive-post-btn")?.addEventListener("click", () => {
      if (!state.me) return openAuth();
      const ids = archivedPostIds(state.me.username); const id = postEl.dataset.id;
      const next = ids.includes(id) ? ids.filter((x)=>x!==id) : [...ids, id];
      setArchivedPostIds(state.me.username, next); toast(ids.includes(id) ? "Post unarchived." : "Post archived locally."); loadFeed(true);
    });
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
          await navigator.share(shareData);
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
    postEl.querySelector(".edit-post-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      const cap = postEl.querySelector(".caption-text");
      const next = prompt("Edit caption:", (cap?.textContent || "").trim());
      if (next == null) return;
      try {
        const { post } = await api(`/api/posts/${postEl.dataset.id}`, { method: "PATCH", body: JSON.stringify({ caption: next.slice(0, 2200) }) });
        if (cap) cap.innerHTML = formatCaption(post.caption || "");
        toast("Caption updated.");
      } catch (err) { toast(err.message, "error"); }
      finally { b.disabled=false; b.textContent="Export my data"; }
    });
    postEl.querySelector(".delete-post-btn")?.addEventListener("click", async () => {
      if (!state.me || !confirm("Delete this post?")) return;
      try {
        await api(`/api/posts/${postEl.dataset.id}`, { method: "DELETE" });
        toast("Post deleted.");
        if (state.view === "saved") loadSaved(el("savedSearch")?.value || ""); else if (state.view === "feed") loadFeed(true); else if (state.view === "profile") loadProfile(state.me.username); else loadFeed(true);
      } catch (err) { toast(err.message, "error"); }
      finally { b.disabled=false; b.textContent="Export my data"; }
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
      if (!state.me) { openAuth(); toast("Log in to save posts."); return; }
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
        if (state.view === "saved" && !res.saved) loadSaved(el("savedSearch")?.value || "");
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
        postEl.querySelectorAll(".comment-copy-btn").forEach((btn)=>btn.addEventListener("click", async ()=>{
      const text = btn.closest(".comment")?.querySelector("span")?.innerText || "";
      try { await navigator.clipboard?.writeText?.(text.replace(/^Pinned\s*/,"").trim()); toast("Comment copied."); } catch { toast("Could not copy comment."); }
    }));
    postEl.querySelectorAll(".comment-edit-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!state.me) return openAuth();
        const node = btn.closest(".comment"); const commentId = node?.dataset.commentId;
        const current = (node?.querySelector("span")?.textContent || "").replace(/^[^:]*:/, "").trim() || (node?.innerText || "");
        const next = prompt("Edit comment:", current); if (next == null) return;
        try { const { comment } = await api(`/api/posts/${postEl.dataset.id}/comments/${commentId}`, { method: "PATCH", body: JSON.stringify({ text: next.slice(0,500) }) }); const strong = node?.querySelector("strong.profile-link"); node.querySelector("span").innerHTML = `${strong ? strong.outerHTML : ""} ${esc(comment.text || "")}`; toast("Comment updated."); }
        catch (e) { toast(e.message, "error"); }
      });
    });
    postEl.querySelectorAll(".caption-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const span = btn.closest(".caption-text"); if (!span) return;
        const full = span.dataset.fullCaption || "";
        const expanded = btn.textContent === "less";
        if (expanded) { span.innerHTML = formatCaption(full.slice(0,120)) + '... <button type="button" class="caption-toggle" style="border:0;background:none;color:var(--muted);cursor:pointer;padding:0;font:inherit">more</button>'; }
        else { span.innerHTML = formatCaption(full) + ' <button type="button" class="caption-toggle" style="border:0;background:none;color:var(--muted);cursor:pointer;padding:0;font:inherit">less</button>'; }
        span.querySelector(".caption-toggle")?.addEventListener("click", arguments.callee);
      });
    });
    postEl.querySelectorAll(".emoji-btn").forEach((b)=>b.addEventListener("click",()=>{ if(cInput){ cInput.value = (cInput.value ? cInput.value + " " : "") + b.dataset.emoji; cInput.dispatchEvent(new Event("input")); cInput.focus(); } }));
    postEl.querySelectorAll(".comment-pin-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const postId = postEl.dataset.id; const id = btn.dataset.commentId; const ids = pinnedCommentIds(postId);
        const next = ids.includes(id) ? ids.filter((x)=>x!==id) : [id, ...ids].slice(0,3);
        setPinnedCommentIds(postId, next); toast(ids.includes(id) ? "Comment unpinned." : "Comment pinned.");
        if (state.view === "profile") loadProfile(state.me?.username); else loadFeed(true);
      });
    });
    postEl.querySelector(".comment-sort")?.addEventListener("change", () => {
      const sort = postEl.querySelector(".comment-sort")?.value || "top";
      const wrap = postEl.querySelector(".comments"); if (!wrap) return;
      const items = Array.from(wrap.querySelectorAll(".comment"));
      // Re-fetch not needed; just reload view for simplicity
      if (state.view === "profile") loadProfile(state.me?.username); else loadFeed(true);
    });
    postEl.querySelectorAll(".caption-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const span = btn.closest(".caption-text"); if (!span) return;
        const full = span.dataset.fullCaption || "";
        const expanded = btn.textContent === "less";
        if (expanded) { span.innerHTML = formatCaption(full.slice(0,120)) + '... <button type="button" class="caption-toggle" style="border:0;background:none;color:var(--muted);cursor:pointer;padding:0;font:inherit">more</button>'; }
        else { span.innerHTML = formatCaption(full) + ' <button type="button" class="caption-toggle" style="border:0;background:none;color:var(--muted);cursor:pointer;padding:0;font:inherit">less</button>'; }
        span.querySelector(".caption-toggle")?.addEventListener("click", arguments.callee);
      });
    });
    postEl.querySelectorAll(".emoji-btn").forEach((b)=>b.addEventListener("click",()=>{ if(cInput){ cInput.value = (cInput.value ? cInput.value + " " : "") + b.dataset.emoji; cInput.dispatchEvent(new Event("input")); cInput.focus(); } }));
    postEl.querySelectorAll(".comment-pin-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const postId = postEl.dataset.id; const id = btn.dataset.commentId; const ids = pinnedCommentIds(postId);
        const next = ids.includes(id) ? ids.filter((x)=>x!==id) : [id, ...ids].slice(0,3);
        setPinnedCommentIds(postId, next); toast(ids.includes(id) ? "Comment unpinned." : "Comment pinned.");
        if (state.view === "profile") loadProfile(state.me?.username); else loadFeed(true);
      });
    });
    postEl.querySelectorAll(".comment-report-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!state.me) return openAuth();
        const commentId = btn.closest(".comment")?.dataset.commentId;
        try { btn.disabled = true; await api(`/api/posts/${postEl.dataset.id}/comments/${commentId}/report`, { method: "POST", body: JSON.stringify({ reason: "inappropriate" }) }); btn.textContent = "Reported"; toast("Comment reported."); }
        catch (e) { btn.disabled = false; toast(e.message, "error"); }
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
    const cInput = postEl.querySelector(".comment-form input[name=text]");
    const cCount = postEl.querySelector(".comment-char-count");
    cInput?.addEventListener("input", ()=>{ if(cCount) cCount.textContent = `${(cInput.value||"").length}/500`; });
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
        optimistic.outerHTML = `<div class="comment" data-comment-id="${res.comment.id}" data-comment-user="${state.me.id}"><span><strong class="profile-link" data-profile="${esc(state.me.username)}">${esc(state.me.username)}</strong> ${esc(res.comment.text || text)}</span><span class="comment-actions"><button class="comment-like-btn" type="button" aria-label="Like comment" aria-pressed="false">Like ${res.comment.likesCount || 0}</button><button class="comment-copy-btn" type="button" aria-label="Copy comment">Copy</button><button class="comment-delete-btn" type="button" aria-label="Delete comment">Delete</button></span></div>`;
        bindPostActions(postEl);
        refreshNotificationsBadge(); refreshDmBadge();
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

function renderMe() {
  const btn = el("authBtn");
  if (btn) {
    const label = btn.querySelector(".nav-label") || btn;
    label.textContent = state.me ? "Log out" : "Log in";
    btn.setAttribute("aria-label", state.me ? "Log out" : "Log in");
    btn.title = state.me ? "Log out" : "Log in";
  }
  document.querySelectorAll('[data-nav-view="profile"]').forEach((b)=>{ b.disabled = false; });
}

async function loadMe() {
  const { user } = await api("/api/me");
  state.me = user;
  renderMe();
  refreshNotificationsBadge(); refreshDmBadge();
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
function savePostDraft(){ try { const f=el("postForm"); if(!f) return; localStorage.setItem("ig_post_draft", JSON.stringify({ caption:f.caption?.value||"", imageUrl:f.imageUrl?.value||"", altText:f.altText?.value||"", filter:f.filter?.value||"none" })); } catch {} }
function loadPostDraft(){ try { const d=JSON.parse(localStorage.getItem("ig_post_draft")||"null"); const f=el("postForm"); if(!d||!f) return; if(f.caption) f.caption.value=d.caption||""; if(f.imageUrl) f.imageUrl.value=d.imageUrl||""; if(f.altText) f.altText.value=d.altText||""; if(f.filter) f.filter.value=d.filter||"none"; updatePostPreview(); updateCaptionCount(); } catch {} }
el("postCaption")?.addEventListener("input", () => { updateCaptionCount(); savePostDraft(); });
el("postForm")?.addEventListener("input", (e)=>{ if(e.target?.name) savePostDraft(); });
el("postFormReset")?.addEventListener("click", () => { el("postForm")?.reset(); localStorage.removeItem("ig_post_draft"); updatePostPreview(); updateCaptionCount(); el("postFormStatus").textContent = ""; el("postFormStatus").classList.remove("error"); toast("Composer cleared."); });
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
    form.reset(); localStorage.removeItem("ig_post_draft"); updatePostPreview(); updateCaptionCount();
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
  payload.avatar = avatar; payload.website = website;
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
document.addEventListener("keydown", (e) => {
  if (e.key === "r" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) { e.preventDefault(); if(state.view==="feed") loadFeed(true); else if(state.view==="notifications") loadNotifications(); else if(state.view==="explore") loadExplore(el("searchInput")?.value||""); else if(state.view==="messages") renderMessages(); else if(state.view==="settings") renderSettings(); else if(state.view==="profile" && currentProfileUsername) loadProfile(currentProfileUsername, currentProfileTab); else if(state.view==="saved") loadSaved(); toast("Refreshed."); return; }
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
el("feedRefreshHint")?.addEventListener("click", ()=>{ el("feedRefreshHint")?.classList.add("hidden"); loadFeed(true); });
window.addEventListener("hashchange", handleRoute);

loadPostDraft();
await loadMe();
await loadStories();
renderMessages();
await handleRoute();

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
