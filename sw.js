/* ==========================================================================
   SHREE SHYAM ENTERPRISES - SERVICE WORKER (sw.js)
   ========================================================================== */

const CACHE_NAME = 'sse-static-v2';
const ASSETS = [
  '/',
  'index.html',
  'products.html',
  'product.html',
  'services.html',
  'cart.html',
  'checkout.html',
  'about.html',
  'gallery.html',
  'contact.html',
  'admin.html',
  'css/variables.css',
  'css/style.css',
  'css/responsive.css',
  'css/animations.css',
  'js/main.js',
  'js/products.js',
  'js/product.js',
  'js/cart.js',
  'js/checkout.js',
  'js/search.js',
  'js/filter.js',
  'js/admin.js',
  'js/animation.js'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Never cache JSON data files so admin panel updates are always fresh
  if (e.request.url.includes('data/products.json') || e.request.url.includes('data/categories.json')) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cachedRes => {
      return cachedRes || fetch(e.request);
    })
  );
});
