import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const dbPath = path.join(dataDir, "db.json");
const uploadsDir = path.join(root, "uploads");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

function seed() {
  const now = Date.now();
  const demoPass = bcrypt.hashSync("password123", 10);
  return {
    users: [
      { id: "u_demo", username: "demo", name: "Demo User", password: demoPass, bio: "Building an Instagram clone.", avatar: "", saved: [], following: ["u_alex"] },
      { id: "u_alex", username: "alex", name: "Alex Rivera", password: demoPass, bio: "Coffee, code, sunsets.", avatar: "", saved: [], following: ["u_demo"] },
      { id: "u_sam", username: "sam", name: "Sam Lee", password: demoPass, bio: "Travel snapshots.", avatar: "", saved: [], following: [] }
    ],
    posts: [
      { id: nanoid(10), userId: "u_alex", image: "https://picsum.photos/seed/ig1/1080/1080", caption: "Morning light in the city. #sunrise", createdAt: now - 3600_000, likes: ["u_demo"], comments: [{ id: nanoid(8), userId: "u_demo", text: "Great shot!", createdAt: now - 3000_000, likes: [] }] },
      { id: nanoid(10), userId: "u_sam", image: "https://picsum.photos/seed/ig2/1080/1350", caption: "Weekend escape.", createdAt: now - 7200_000, likes: [], comments: [] },
      { id: nanoid(10), userId: "u_demo", image: "https://picsum.photos/seed/ig3/1080/1080", caption: "Phase 1 complete: core UI scaffold. #buildinpublic", createdAt: now - 9000_000, likes: ["u_alex"], comments: [] }
    ],
    stories: [
      { id: nanoid(8), userId: "u_alex", image: "https://picsum.photos/seed/story1/540/960", createdAt: now - 1800_000 },
      { id: nanoid(8), userId: "u_sam", image: "https://picsum.photos/seed/story2/540/960", createdAt: now - 5400_000 }
    ],
    messages: [],
    notifications: []
  };
}

function loadDb() {
  if (!fs.existsSync(dbPath)) {
    const db = seed();
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return db;
  }
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  db.users = (db.users || []).map((u) => ({ ...u, saved: Array.isArray(u.saved) ? u.saved : [], following: Array.isArray(u.following) ? u.following : [] }));
  db.posts = (db.posts || []).map((p) => ({
    ...p,
    filter: p.filter || "none",
    comments: (p.comments || []).map((c) => ({ ...c, likes: Array.isArray(c.likes) ? c.likes : [] }))
  }));
  db.stories = db.stories || [];
  db.messages = db.messages || [];
  db.notifications = db.notifications || [];
  return db;
}

function saveDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

function currentUser(req, db) {
  if (!req.session.userId) return null;
  return db.users.find((u) => u.id === req.session.userId) || null;
}

function addNotification(db, { userId, actorId, type, postId = null, text = "" }) {
  if (!userId || !actorId || userId === actorId) return;
  db.notifications = db.notifications || [];
  db.notifications.unshift({ id: nanoid(10), userId, actorId, type, postId, text, createdAt: Date.now(), read: false });
  db.notifications = db.notifications.slice(0, 200);
}

function safeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function mapComment(db, c, me) {
  const likes = Array.isArray(c.likes) ? c.likes : [];
  return {
    ...c,
    likes,
    likesCount: likes.length,
    likedByMe: me ? likes.includes(me.id) : false,
    user: safeUser(db.users.find((u) => u.id === c.userId))
  };
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${nanoid(6)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "instagram-clone-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax" }
}));

app.use("/uploads", express.static(uploadsDir));
app.use(express.static(path.join(root, "public")));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/me", (req, res) => {
  const db = loadDb();
  res.json({ user: safeUser(currentUser(req, db)) });
});

app.post("/api/auth/signup", async (req, res) => {
  const { username = "", name = "", password = "" } = req.body || {};
  if (username.length < 3 || password.length < 6) return res.status(400).json({ error: "Username >= 3 chars and password >= 6 chars required." });
  const db = loadDb();
  if (db.users.some((u) => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: "Username already exists." });
  const user = { id: `u_${nanoid(8)}`, username, name: name || username, password: await bcrypt.hash(password, 10), bio: "", avatar: "" };
  db.users.push(user);
  saveDb(db);
  req.session.userId = user.id;
  res.json({ user: safeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { username = "", password = "" } = req.body || {};
  const db = loadDb();
  const user = db.users.find((u) => u.username.toLowerCase() === String(username).toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid credentials." });
  req.session.userId = user.id;
  res.json({ user: safeUser(user) });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

function mapPost(db, p, me) {
  const saved = new Set(me?.saved || []);
  return {
    ...p,
    user: safeUser(db.users.find((u) => u.id === p.userId)),
    likesCount: p.likes.length,
    likedByMe: me ? p.likes.includes(me.id) : false,
    savedByMe: me ? saved.has(p.id) : false,
    comments: (p.comments || []).map((c) => mapComment(db, c, me))
  };
}

app.get("/api/feed", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  const offset = Math.max(0, Number(req.query.offset || 0));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const all = [...db.posts].sort((a, b) => b.createdAt - a.createdAt);
  const slice = all.slice(offset, offset + limit);
  const posts = slice.map((p) => mapPost(db, p, me));
  res.json({ posts, offset, limit, total: all.length, hasMore: offset + slice.length < all.length });
});

app.get("/api/posts/:id", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  res.json({ post: mapPost(db, post, me) });
});

app.post("/api/posts", upload.single("image"), (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const imageUrl = String(req.body.imageUrl || req.body.image || "").trim();
  const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;
  if (!image) return res.status(400).json({ error: "Image file or image URL required." });
  if (!req.file && !(/^https?:\/\//i.test(image) || image.startsWith("/uploads/"))) return res.status(400).json({ error: "Image URL must start with http(s) or /uploads/." });
  const filter = String(req.body.filter || "none").slice(0, 40);
  const post = { id: nanoid(10), userId: me.id, image, caption: String(req.body.caption || "").slice(0, 2200), filter, createdAt: Date.now(), likes: [], comments: [] };
  db.posts.unshift(post);
  saveDb(db);
  res.json({ post: { ...post, user: safeUser(me), likesCount: 0, likedByMe: false, savedByMe: false, comments: [] } });
});

app.delete("/api/posts/:id", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const idx = db.posts.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Post not found." });
  if (db.posts[idx].userId !== me.id) return res.status(403).json({ error: "You can only delete your own posts." });
  const [removed] = db.posts.splice(idx, 1);
  db.users.forEach((u) => { if (Array.isArray(u.saved)) u.saved = u.saved.filter((id) => id !== removed.id); });
  db.notifications = (db.notifications || []).filter((n) => n.postId !== removed.id);
  if (removed.image && removed.image.startsWith("/uploads/")) {
    const fp = path.join(root, removed.image.replace(/^\//, ""));
    fs.rm(fp, { force: true }, () => {});
  }
  saveDb(db);
  res.json({ ok: true });
});

app.post("/api/posts/:id/like", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  const i = post.likes.indexOf(me.id);
  if (i >= 0) post.likes.splice(i, 1); else { post.likes.push(me.id); addNotification(db, { userId: post.userId, actorId: me.id, type: "like", postId: post.id }); }
  saveDb(db);
  res.json({ liked: post.likes.includes(me.id), likesCount: post.likes.length });
});

app.post("/api/posts/:id/save", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const user = db.users.find((u) => u.id === me.id);
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post || !user) return res.status(404).json({ error: "Not found." });
  user.saved = Array.isArray(user.saved) ? user.saved : [];
  const i = user.saved.indexOf(post.id);
  if (i >= 0) user.saved.splice(i, 1); else user.saved.push(post.id);
  saveDb(db);
  res.json({ saved: user.saved.includes(post.id) });
});

app.get("/api/saved", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const user = db.users.find((u) => u.id === me.id);
  const ids = new Set(user?.saved || []);
  const posts = db.posts.filter((p) => ids.has(p.id)).sort((a, b) => b.createdAt - a.createdAt).map((p) => ({
    ...p,
    user: safeUser(db.users.find((u) => u.id === p.userId)),
    likesCount: p.likes.length,
    likedByMe: p.likes.includes(me.id),
    savedByMe: true,
    comments: (p.comments || []).map((c) => mapComment(db, c, me))
  }));
  res.json({ posts });
});

app.post("/api/posts/:id/comments", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Comment required." });
  const comment = { id: nanoid(8), userId: me.id, text: text.slice(0, 500), createdAt: Date.now(), likes: [] };
  post.comments.push(comment);
  addNotification(db, { userId: post.userId, actorId: me.id, type: "comment", postId: post.id, text: comment.text });
  saveDb(db);
  res.json({ comment: mapComment(db, comment, me) });
});

app.delete("/api/posts/:id/comments/:commentId", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  post.comments = post.comments || [];
  const idx = post.comments.findIndex((c) => c.id === req.params.commentId);
  if (idx < 0) return res.status(404).json({ error: "Comment not found." });
  const comment = post.comments[idx];
  if (comment.userId !== me.id && post.userId !== me.id) return res.status(403).json({ error: "You can only delete your own comments or comments on your post." });
  post.comments.splice(idx, 1);
  db.notifications = (db.notifications || []).filter((n) => !(n.postId === post.id && n.type === "comment_like" && n.text === comment.text && n.userId === comment.userId));
  saveDb(db);
  res.json({ ok: true });
});

app.post("/api/posts/:id/comments/:commentId/like", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  const comment = (post.comments || []).find((c) => c.id === req.params.commentId);
  if (!comment) return res.status(404).json({ error: "Comment not found." });
  comment.likes = Array.isArray(comment.likes) ? comment.likes : [];
  const i = comment.likes.indexOf(me.id);
  if (i >= 0) comment.likes.splice(i, 1); else { comment.likes.push(me.id); addNotification(db, { userId: comment.userId, actorId: me.id, type: "comment_like", postId: post.id, text: comment.text }); }
  saveDb(db);
  res.json({ liked: comment.likes.includes(me.id), likesCount: comment.likes.length });
});

app.get("/api/notifications", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const notifications = (db.notifications || []).filter((n) => n.userId === me.id).slice(0, 50).map((n) => ({
    ...n,
    actor: safeUser(db.users.find((u) => u.id === n.actorId)),
    post: db.posts.find((p) => p.id === n.postId) ? { id: n.postId } : null
  }));
  res.json({ notifications, unread: notifications.filter((n) => !n.read).length });
});

app.post("/api/notifications/read", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const ids = Array.isArray(req.body?.ids) ? new Set(req.body.ids.map(String).filter(Boolean)) : null;
  let changed = 0;
  (db.notifications || []).forEach((n) => {
    if (n.userId !== me.id || n.read) return;
    if (ids && ids.size && !ids.has(String(n.id))) return;
    n.read = true;
    changed += 1;
  });
  if (changed) saveDb(db);
  const unread = (db.notifications || []).filter((n) => n.userId === me.id && !n.read).length;
  res.json({ ok: true, unread });
});

app.post("/api/me/profile", (req, res) => {
  const db = loadDb();
  const meUser = currentUser(req, db);
  if (!meUser) return res.status(401).json({ error: "Login required." });
  const me = db.users.find((u) => u.id === meUser.id);
  if (!me) return res.status(404).json({ error: "User not found." });
  const name = String(req.body.name ?? me.name ?? "").trim().slice(0, 80);
  const bio = String(req.body.bio ?? me.bio ?? "").trim().slice(0, 150);
  const avatar = String(req.body.avatar ?? me.avatar ?? "").trim().slice(0, 500);
  me.name = name || me.username;
  me.bio = bio;
  if (!avatar || /^https?:\/\//i.test(avatar) || avatar.startsWith("/uploads/")) me.avatar = avatar;
  saveDb(db);
  res.json({ user: safeUser(me) });
});

app.get("/api/messages/conversations", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const mine = (db.messages || []).filter((m) => m.from === me.id || m.to === me.id);
  const map = new Map();
  for (const m of mine) {
    const otherId = m.from === me.id ? m.to : m.from;
    const prev = map.get(otherId);
    if (!prev || m.createdAt > prev.createdAt) map.set(otherId, m);
  }
  const conversations = [...map.entries()].map(([userId, last]) => ({
    user: safeUser(db.users.find((u) => u.id === userId)),
    last: { ...last, fromUser: safeUser(db.users.find((u) => u.id === last.from)) }
  })).filter((c) => c.user).sort((a, b) => b.last.createdAt - a.last.createdAt);
  const contacts = db.users.filter((u) => u.id !== me.id).map(safeUser);
  res.json({ conversations, contacts });
});

app.get("/api/messages/:userId", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const other = db.users.find((u) => u.id === req.params.userId);
  if (!other) return res.status(404).json({ error: "User not found." });
  const messages = (db.messages || []).filter((m) => (m.from === me.id && m.to === other.id) || (m.from === other.id && m.to === me.id)).sort((a, b) => a.createdAt - b.createdAt).map((m) => ({ ...m, fromUser: safeUser(db.users.find((u) => u.id === m.from)) }));
  res.json({ user: safeUser(other), messages });
});

app.post("/api/messages/:userId", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const other = db.users.find((u) => u.id === req.params.userId);
  if (!other) return res.status(404).json({ error: "User not found." });
  const text = String(req.body.text || "").trim();
  if (!text) return res.status(400).json({ error: "Message required." });
  const msg = { id: nanoid(10), from: me.id, to: other.id, text: text.slice(0, 1000), createdAt: Date.now() };
  db.messages = db.messages || [];
  db.messages.push(msg);
  saveDb(db);
  res.json({ message: { ...msg, fromUser: safeUser(me) } });
});

app.post("/api/stories", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const image = String(req.body.image || "").trim();
  if (!image || !(/^https?:\/\//i.test(image) || image.startsWith("/uploads/"))) return res.status(400).json({ error: "Valid image URL required." });
  const story = { id: nanoid(8), userId: me.id, image: image.slice(0, 500), createdAt: Date.now() };
  db.stories.unshift(story);
  saveDb(db);
  res.json({ story: { ...story, user: safeUser(me) } });
});

app.get("/api/stories", (req, res) => {
  const db = loadDb();
  const stories = [...db.stories].sort((a, b) => b.createdAt - a.createdAt).map((s) => ({ ...s, user: safeUser(db.users.find((u) => u.id === s.userId)) }));
  res.json({ stories });
});

app.get("/api/users/:username", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  const user = db.users.find((u) => u.username.toLowerCase() === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found." });
  const posts = db.posts.filter((p) => p.userId === user.id).sort((a, b) => b.createdAt - a.createdAt).map((p) => ({ ...p, filter: p.filter || "none" }));
  const followers = db.users.filter((u) => (u.following || []).includes(user.id)).length;
  const following = (user.following || []).length;
  const isFollowing = me ? (me.following || []).includes(user.id) : false;
  res.json({ user: safeUser(user), posts, followers, following, isFollowing, isMe: !!me && me.id === user.id });
});

app.post("/api/users/:username/follow", (req, res) => {
  const db = loadDb();
  const meUser = currentUser(req, db);
  if (!meUser) return res.status(401).json({ error: "Login required." });
  const me = db.users.find((u) => u.id === meUser.id);
  const target = db.users.find((u) => u.username.toLowerCase() === req.params.username.toLowerCase());
  if (!target || !me) return res.status(404).json({ error: "User not found." });
  if (target.id === me.id) return res.status(400).json({ error: "Cannot follow yourself." });
  me.following = Array.isArray(me.following) ? me.following : [];
  const i = me.following.indexOf(target.id);
  let following;
  if (i >= 0) { me.following.splice(i, 1); following = false; }
  else { me.following.push(target.id); following = true; addNotification(db, { userId: target.id, actorId: me.id, type: "follow" }); }
  saveDb(db);
  const followers = db.users.filter((u) => (u.following || []).includes(target.id)).length;
  res.json({ following, followers });
});

app.get("/api/search", (req, res) => {
  const qRaw = String(req.query.q || "").trim();
  const q = qRaw.toLowerCase();
  const db = loadDb();
  const me = currentUser(req, db);
  const saved = new Set(me?.saved || []);
  if (!q) return res.json({ users: [], posts: [], q: qRaw });
  const users = db.users.filter((u) => u.username.toLowerCase().includes(q.replace(/^#/, "")) || (u.name || "").toLowerCase().includes(q)).map(safeUser);
  const posts = db.posts.filter((p) => {
    const cap = String(p.caption || "").toLowerCase();
    if (q.startsWith("#")) return cap.includes(q);
    return cap.includes(q) || (p.filter || "").toLowerCase().includes(q);
  }).map((p) => ({
    ...p,
    user: safeUser(db.users.find((u) => u.id === p.userId)),
    likesCount: p.likes.length,
    likedByMe: me ? p.likes.includes(me.id) : false,
    savedByMe: me ? saved.has(p.id) : false,
    comments: (p.comments || []).map((c) => mapComment(db, c, me))
  }));
  res.json({ users, posts, q: qRaw });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(root, "public", "index.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Instagram Clone running at http://localhost:${port}`));
