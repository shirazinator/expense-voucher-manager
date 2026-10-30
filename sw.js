const CACHE_NAME = 'expense-voucher-cache-v2';
const ASSETS = [
  './',
  './index.html',
  './db.js',
  './demo-data.js',
  './pdf-export.js',
  './excel-export.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first strategy: always fetch the latest updates from network; fallback to cache if offline
self.addEventListener('fetch', (e) => {
  // Only handle GET requests for same origin or relative paths
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      })
      .catch(() => caches.match(e.request).then((cachedRes) => cachedRes || caches.match('./index.html')))
  );
});
