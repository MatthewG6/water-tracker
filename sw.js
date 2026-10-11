const BASE = new URL('./', self.location).href;
const CACHE = 'daily-water-f5ce08a28be2';
const ASSETS = ["./","index.html","style.css","app.js","data.js","view.js","manifest.json","icon.svg","180.png","192.png","512.png","vendor/chart.umd.min.js","fonts/dm-sans-400.woff2","fonts/dm-sans-600.woff2","fonts/dm-serif-display-400.woff2"].map(path => new URL(path, BASE).href);
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('daily-water-') && key !== CACHE).map(key => caches.delete(key)))),self.clients.claim()])));
self.addEventListener('message', event => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(BASE)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(new URL('index.html', BASE).href)));
  } else {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
  }
});
