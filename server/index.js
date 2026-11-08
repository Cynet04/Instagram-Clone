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
      { id: "u_demo", username: "demo", name: "Demo User", password: demoPass, bio: "Building an Instagram clone.", avatar: "", saved: [] },
      { id: "u_alex", username: "alex", name: "Alex Rivera", password: demoPass, bio: "Coffee, code, sunsets.", avatar: "", saved: [] },
      { id: "u_sam", username: "sam", name: "Sam Lee", password: demoPass, bio: "Travel snapshots.", avatar: "", saved: [] }
    ],
    posts: [
      { id: nanoid(10), userId: "u_alex", image: "https://picsum.photos/seed/ig1/1080/1080", caption: "Morning light in the city.", createdAt: now - 3600_000, likes: ["u_demo"], comments: [{ id: nanoid(8), userId: "u_demo", text: "Great shot!", createdAt: now - 3000_000 }] },
      { id: nanoid(10), userId: "u_sam", image: "https://picsum.photos/seed/ig2/1080/1350", caption: "Weekend escape.", createdAt: now - 7200_000, likes: [], comments: [] },
      { id: nanoid(10), userId: "u_demo", image: "https://picsum.photos/seed/ig3/1080/1080", caption: "Phase 1 complete: core UI scaffold.", createdAt: now - 9000_000, likes: ["u_alex"], comments: [] }
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
  db.users = (db.users || []).map((u) => ({ saved: [], ...u, saved: Array.isArray(u.saved) ? u.saved : [] }));
  db.posts = db.posts || [];
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

function safeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
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

app.get("/api/feed", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  const saved = new Set(me?.saved || []);
  const posts = [...db.posts].sort((a, b) => b.createdAt - a.createdAt).map((p) => {
    const user = db.users.find((u) => u.id === p.userId);
    return {
      ...p,
      user: safeUser(user),
      likesCount: p.likes.length,
      likedByMe: me ? p.likes.includes(me.id) : false,
      savedByMe: me ? saved.has(p.id) : false,
      comments: p.comments.map((c) => ({ ...c, user: safeUser(db.users.find((u) => u.id === c.userId)) }))
    };
  });
  res.json({ posts });
});

app.post("/api/posts", upload.single("image"), (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
  if (!image) return res.status(400).json({ error: "Image required." });
  const post = { id: nanoid(10), userId: me.id, image, caption: String(req.body.caption || "").slice(0, 2200), createdAt: Date.now(), likes: [], comments: [] };
  db.posts.unshift(post);
  saveDb(db);
  res.json({ post: { ...post, user: safeUser(me), likesCount: 0, likedByMe: false } });
});

app.post("/api/posts/:id/like", (req, res) => {
  const db = loadDb();
  const me = currentUser(req, db);
  if (!me) return res.status(401).json({ error: "Login required." });
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  const i = post.likes.indexOf(me.id);
  if (i >= 0) post.likes.splice(i, 1); else post.likes.push(me.id);
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
    comments: p.comments.map((c) => ({ ...c, user: safeUser(db.users.find((u) => u.id === c.userId)) }))
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
  const comment = { id: nanoid(8), userId: me.id, text: text.slice(0, 500), createdAt: Date.now() };
  post.comments.push(comment);
  saveDb(db);
  res.json({ comment: { ...comment, user: safeUser(me) } });
});

app.get("/api/stories", (req, res) => {
  const db = loadDb();
  const stories = [...db.stories].sort((a, b) => b.createdAt - a.createdAt).map((s) => ({ ...s, user: safeUser(db.users.find((u) => u.id === s.userId)) }));
  res.json({ stories });
});

app.get("/api/users/:username", (req, res) => {
  const db = loadDb();
  const user = db.users.find((u) => u.username.toLowerCase() === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: "User not found." });
  const posts = db.posts.filter((p) => p.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  res.json({ user: safeUser(user), posts });
});

app.get("/api/search", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const db = loadDb();
  if (!q) return res.json({ users: [], posts: [] });
  const users = db.users.filter((u) => u.username.toLowerCase().includes(q) || (u.name || "").toLowerCase().includes(q)).map(safeUser);
  const posts = db.posts.filter((p) => (p.caption || "").toLowerCase().includes(q)).map((p) => ({ ...p, user: safeUser(db.users.find((u) => u.id === p.userId)) }));
  res.json({ users, posts });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(root, "public", "index.html"));
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Instagram Clone running at http://localhost:${port}`));
