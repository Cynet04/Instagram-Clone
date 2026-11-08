self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('socially-static-v1').then((c) => c.addAll(['/', '/index.html', '/css/styles.css', '/js/app.js', '/manifest.webmanifest', '/icons/icon.svg'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return; // never cache private/auth/upload API responses
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
    if (res.ok && url.origin === location.origin) caches.open('socially-static-v1').then((c) => c.put(e.request, res.clone())).catch(()=>{});
    return res;
  }).catch(() => hit || caches.match('/index.html'))));
});
