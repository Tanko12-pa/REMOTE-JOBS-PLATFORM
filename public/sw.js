// Service Worker for Remote Jobs Platform PWA
const CACHE_NAME = 'remote-jobs-v2';
const API_CACHE_NAME = 'remote-jobs-api-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/index.css',
  '/src/data/platformsData.ts',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Pre-cache core app shell & key job assets during Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell, platform lists & job assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Purge stale legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== API_CACHE_NAME) {
            console.log('[SW] Clearing outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Handle API responses, Job Assets, and Static App Shell
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or browser extension requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Strategy for API Responses & Job Platforms data requests: Cache First then Network Fallback
  if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.includes('/platforms') || requestUrl.pathname.includes('/jobs')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);

        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 304)) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            return cachedResponse || new Response(
              JSON.stringify({ offline: true, message: 'Platform List and Saved Jobs served from local offline PWA cache.' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Strategy for App Shell & Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || cachedResponse;
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Service Worker Message Listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
