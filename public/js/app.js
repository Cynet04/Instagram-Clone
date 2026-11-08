const state = { me: null, view: "feed", authMode: "login" };

const el = (id) => document.getElementById(id);
const views = ["feed", "explore", "notifications", "saved", "messages", "profile", "search"];

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, credentials: "same-origin", ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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

function setView(view) {
  state.view = view;
  for (const v of views) el(`view-${v}`)?.classList.toggle("hidden", v !== view);
  el("stories").classList.toggle("hidden", view !== "feed");
  el("composer").classList.toggle("hidden", view !== "feed" || !state.me);
  if (view === "feed") loadFeed();
  if (view === "explore") loadExplore();
  if (view === "notifications") loadNotifications();
  if (view === "saved") loadSaved();
  if (view === "messages") renderMessages();
  if (view === "profile") loadProfile(state.me?.username);
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

function renderSuggestions(users = []) {
  const picks = users.filter((u) => u.username !== state.me?.username).slice(0, 5);
  el("suggestions").innerHTML = picks.map((u) => `
    <div class="suggestion">
      <img class="avatar" src="${avatar(u)}" alt="" />
      <div><div><strong>${esc(u.username)}</strong></div><small class="muted">Suggested for you</small></div>
      <button data-user="${esc(u.username)}">View</button>
    </div>`).join("") || `<small class="muted">No suggestions yet.</small>`;
  el("suggestions").querySelectorAll("button[data-user]").forEach((b) => b.onclick = () => loadProfile(b.dataset.user));
}

function postHtml(p) {
  return `
    <article class="card post" data-id="${p.id}">
      <div class="post-head">
        <img class="avatar" src="${avatar(p.user)}" alt="" />
        <span class="post-user">${esc(p.user?.username || "user")}</span>
        <span class="post-time">${timeAgo(p.createdAt)}</span>
      </div>
      <img class="post-image" src="${esc(p.image)}" alt="post" loading="lazy" />
      <div class="post-actions">
        <button class="like-btn ${p.likedByMe ? "liked" : ""}" aria-label="Like">Like</button>
        <button aria-label="Comment" onclick="document.querySelector('[data-id=\\'${p.id}\\'] .comment-form input')?.focus()">Comment</button>
        <button class="save-btn ${p.savedByMe ? "saved" : ""}" aria-label="Save" style="margin-left:auto">${p.savedByMe ? "Saved" : "Save"}</button>
      </div>
      <div class="post-likes">${p.likesCount} likes</div>
      <div class="post-caption"><strong>${esc(p.user?.username || "")}</strong> ${esc(p.caption || "")}</div>
      <div class="comments">${(p.comments || []).map((c) => `<div class="comment"><strong>${esc(c.user?.username || "user")}</strong> ${esc(c.text)}</div>`).join("")}</div>
      <form class="comment-form">
        <input name="text" placeholder="Add a comment..." maxlength="500" ${state.me ? "" : "disabled"} />
        <button ${state.me ? "" : "disabled"}>Post</button>
      </form>
    </article>`;
}

async function loadStories() {
  const { stories } = await api("/api/stories");
  const users = new Map();
  stories.forEach((s) => { if (s.user && !users.has(s.user.id)) users.set(s.user.id, s.user); });
  el("stories").innerHTML = [...users.values()].map((u) => `
    <div class="story"><img src="${avatar(u)}" alt="" /><span>${esc(u.username)}</span></div>`).join("") || `<div class="story"><span>No stories</span></div>`;
}

async function loadFeed() {
  const [{ posts }, search] = await Promise.all([api("/api/feed"), api("/api/search?q=a")]);
  el("view-feed").innerHTML = posts.map(postHtml).join("") || `<div class="card" style="padding:16px">No posts yet.</div>`;
  bindPostActions(el("view-feed"));
  renderSuggestions(search.users || []);
}

async function loadExplore() {
  const { posts } = await api("/api/feed");
  el("view-explore").innerHTML = `<div class="card" style="padding:14px"><h3 style="margin:0 0 10px">Explore</h3><div class="explore-grid">${posts.map((p) => `<img src="${esc(p.image)}" alt="" loading="lazy" />`).join("")}</div></div>`;
}

async function loadSaved() {
  if (!state.me) { el("view-saved").innerHTML = `<div class="card" style="padding:16px">Log in to view saved posts.</div>`; return; }
  try {
    const { posts } = await api("/api/saved");
    el("view-saved").innerHTML = `<div class="card" style="padding:14px"><h3 style="margin:0 0 10px">Saved</h3></div>` + (posts.map(postHtml).join("") || `<div class="card" style="padding:16px">No saved posts yet.</div>`);
    bindPostActions(el("view-saved"));
  } catch (e) { el("view-saved").innerHTML = `<div class="card" style="padding:16px">${esc(e.message)}</div>`; }
}

async function loadNotifications() {
  if (!state.me) { el("view-notifications").innerHTML = `<div class="card" style="padding:16px">Log in to view notifications.</div>`; return; }
  try {
    const { notifications, unread } = await api("/api/notifications");
    updateBadge(unread);
    el("view-notifications").innerHTML = `<div class="card"><div style="padding:14px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Notifications</h3><button id="markReadBtn" style="border:0;background:none;color:var(--blue);font-weight:600">Mark read</button></div>` +
      (notifications.map((n) => {
        const actor = esc(n.actor?.username || "Someone");
        const msg = n.type === "like" ? "liked your post" : n.type === "comment" ? `commented: ${esc(n.text || "")}` : "interacted with you";
        return `<div class="notif ${n.read ? "" : "unread"}"><img class="avatar" src="${avatar(n.actor)}" alt="" style="width:34px;height:34px" /><div><strong>${actor}</strong> ${msg}<div style="color:var(--muted);font-size:12px">${timeAgo(n.createdAt)}</div></div></div>`;
      }).join("") || `<div style="padding:16px">No notifications yet.</div>`) + `</div>`;
    el("markReadBtn")?.addEventListener("click", async () => { await api("/api/notifications/read", { method: "POST", body: "{}" }); loadNotifications(); });
  } catch (e) { el("view-notifications").innerHTML = `<div class="card" style="padding:16px">${esc(e.message)}</div>`; }
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

async function loadProfile(username) {
  if (!username) {
    el("view-profile").innerHTML = `<div class="card" style="padding:16px">Log in to view your profile.</div>`;
    setView("profile");
    return;
  }
  const { user, posts } = await api(`/api/users/${encodeURIComponent(username)}`);
  el("view-profile").innerHTML = `
    <div class="card">
      <div class="profile-head">
        <img class="avatar" src="${avatar(user)}" alt="" />
        <div>
          <h2 style="margin:0 0 6px">${esc(user.username)}</h2>
          <div><strong>${posts.length}</strong> posts</div>
          <div style="margin-top:6px"><strong>${esc(user.name || "")}</strong></div>
          <div>${esc(user.bio || "")}</div>
        </div>
      </div>
    </div>
    <div class="card" style="padding:4px"><div class="grid">${posts.map((p) => `<img src="${esc(p.image)}" alt="" loading="lazy" />`).join("") || `<div style="padding:16px">No posts</div>`}</div></div>`;
  setView("profile");
}

async function loadSearch(q) {
  const { users, posts } = await api(`/api/search?q=${encodeURIComponent(q)}`);
  el("view-search").innerHTML = `<div class="card" style="padding:14px"><h3>Search: ${esc(q)}</h3>
    <h4>Users</h4>${users.map((u) => `<div class="suggestion"><img class="avatar" src="${avatar(u)}" alt="" /><strong>${esc(u.username)}</strong><button data-user="${esc(u.username)}">View</button></div>`).join("") || "<p>No users</p>"}
    <h4>Posts</h4>${posts.map(postHtml).join("") || "<p>No posts</p>"}</div>`;
  el("view-search").querySelectorAll("button[data-user]").forEach((b) => b.onclick = () => loadProfile(b.dataset.user));
  bindPostActions(el("view-search"));
  setView("search");
}

function renderMessages() {
  el("view-messages").innerHTML = `<div class="card" style="padding:16px"><h3 style="margin-top:0">Messages</h3><p>Direct messaging UI scaffolded for Phase 7. Chat persistence will be added in the next autonomous phases.</p><div style="border:1px solid var(--line);border-radius:8px;padding:12px;min-height:180px;color:var(--muted)">Select a conversation to start messaging.</div></div>`;
}

function bindPostActions(root) {
  root.querySelectorAll(".post").forEach((postEl) => {
    postEl.querySelector(".like-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/like`, { method: "POST", body: "{}" });
        postEl.querySelector(".like-btn").classList.toggle("liked", res.liked);
        postEl.querySelector(".post-likes").textContent = `${res.likesCount} likes`;
      } catch (e) { alert(e.message); }
    });
    postEl.querySelector(".save-btn")?.addEventListener("click", async () => {
      if (!state.me) return openAuth();
      try {
        const res = await api(`/api/posts/${postEl.dataset.id}/save`, { method: "POST", body: "{}" });
        const btn = postEl.querySelector(".save-btn");
        btn.classList.toggle("saved", res.saved);
        btn.textContent = res.saved ? "Saved" : "Save";
        if (state.view === "saved" && !res.saved) loadSaved();
      } catch (e) { alert(e.message); }
    });
    postEl.querySelector(".comment-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.me) return openAuth();
      const input = e.currentTarget.querySelector("input[name=text]");
      const text = input.value.trim();
      if (!text) return;
      try {
        await api(`/api/posts/${postEl.dataset.id}/comments`, { method: "POST", body: JSON.stringify({ text }) });
        input.value = "";
        if (state.view === "saved") loadSaved(); else loadFeed();
        refreshNotificationsBadge();
      } catch (err) { alert(err.message); }
    });
  });
}

function openAuth(mode = "login") {
  state.authMode = mode;
  el("authTitle").textContent = mode === "login" ? "Log in" : "Sign up";
  el("authToggle").textContent = mode === "login" ? "Need an account?" : "Have an account?";
  el("authForm").querySelector('input[name=name]').classList.toggle("hidden", mode === "login");
  el("authError").textContent = "";
  el("authDialog").showModal();
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
el("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const payload = Object.fromEntries(fd.entries());
  try {
    const path = state.authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const { user } = await api(path, { method: "POST", body: JSON.stringify(payload) });
    state.me = user; renderMe(); el("authDialog").close(); setView("feed");
  } catch (err) { el("authError").textContent = err.message; }
});

document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
el("newPostBtn").onclick = () => { if (!state.me) return openAuth(); el("composer").classList.toggle("hidden"); };
el("searchInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) loadSearch(e.currentTarget.value.trim()); });
el("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!state.me) return openAuth();
  const fd = new FormData(e.currentTarget);
  try {
    const res = await fetch("/api/posts", { method: "POST", body: fd, credentials: "same-origin" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    e.currentTarget.reset();
    el("composer").classList.add("hidden");
    await loadFeed();
  } catch (err) { alert(err.message); }
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
applyTheme();

await loadMe();
await loadStories();
renderMessages();
setView("feed");
