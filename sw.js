/* Dicatat! service worker
   Strategy: precache the app shell, then serve stale-while-revalidate.
   The app opens offline; a new deploy is picked up on the load after it is fetched.
   Bump CACHE when you want old caches dropped immediately. */
const CACHE = 'dicatat-shell-v14';
const SHELL = [
  './',
  'index.html',
  'css/base.css',
  'css/layout.css',
  'css/components.css',
  'css/mobile.css',
  'css/maganghub.css',
  'css/mobile-maganghub.css',
  'js/data.js',
  'js/core.js',
  'js/period.js',
  'js/datepicker.js',
  'js/ui.js',
  'js/actions.js',
  'js/reports.js',
  'js/views.js',
  'js/app.js',
  'manifest.webmanifest',
  'favicon.svg',
  'icon-32.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'dicatat-finance-icon.svg',
  'MagangHub Logo - Black - zonalogo.com.svg',
  'MagangHub Logo - White - zonalogo.com.svg',
  'fonts/plus-jakarta-sans-latin.woff2',
  'fonts/plus-jakarta-sans-latin-ext.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req)
        .then(res => {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      const res = await network;
      if (res) return res;
      if (req.mode === 'navigate') return (await cache.match('index.html')) || Response.error();
      return Response.error();
    })
  );
});
