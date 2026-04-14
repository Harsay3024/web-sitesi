const CACHE_NAME = 'atmos-v4';
const DYNAMIC_CACHE = 'atmos-dynamic-v4';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/hakkimizda',
  '/iletisim',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // API İstekleri: "Önce Ağ (Network First)" - İnternet varsa yenisini al, yoksa eskisini (Cache) göster
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => { cache.put(event.request, networkResponse.clone()); return networkResponse; });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Statik Dosyalar (HTML, CSS, JS vb): "Önce Cache (Cache First)" - Hızlı açılması için direkt hafızadan al
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => { return caches.open(DYNAMIC_CACHE).then((cache) => { cache.put(event.request, networkResponse.clone()); return networkResponse; }); });
      })
    );
  }
});

// Kullanıcı uygulamayı güncelle butonuna tıkladığında bekleyen yeni versiyonu aktif et
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});