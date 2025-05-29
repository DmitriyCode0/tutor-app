const CORE_CACHE_NAME = 'tutor-calendar-core-v2'; // Incremented version
const CDN_CACHE_NAME = 'tutor-calendar-cdn-v1'; // Can remain same if CDN assets haven't changed structurally
const ALL_CACHES = [CORE_CACHE_NAME, CDN_CACHE_NAME];

const CORE_ASSETS = [
  '/', 
  '/index.html',
  '/index.tsx', 
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/utils/dateUtils.ts',
  '/utils/lessonUtils.ts',
  '/components/LessonModal.tsx',
  '/components/ViewLessonModal.tsx',
  '/components/AddTipsModal.tsx',
  '/components/ChangePriceModal.tsx',
  '/components/ChangeTimeDurationModal.tsx',
  '/components/ConfirmModal.tsx',
  '/components/TopUpModal.tsx',
  '/components/ReportConfigModal.tsx',
  '/components/ReportViewModal.tsx',
  '/components/SettingsModal.tsx',
  '/components/ToastNotification.tsx',
  '/components/TimeSlotCell.tsx',
  '/components/WeeklyCalendar.tsx',
  '/pages/StatisticsPage.tsx',
  '/pages/StudentsPage.tsx',
  '/styles/global.css',
  '/styles/App.css',
  '/styles/WeeklyCalendar.css',
  '/styles/TimeSlotCell.css',
  '/styles/Modals.css',
  '/styles/forms.css',
  '/styles/buttons.css',
  '/styles/StatisticsPage.css',
  '/styles/StudentsPage.css',
  '/styles/ToastNotification.css',
  '/styles/Settings.css',
  '/manifest.json',
  '/icons/icon-192x192.png', // Example, add your actual icons if you want to precache
  '/icons/icon-512x512.png'
];

const CDN_ORIGINS = [
  'https://esm.sh'
];

self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CORE_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(CORE_ASSETS.map(url => new Request(url, {cache: 'reload'}))); // Ensure fresh assets on install
      })
      .catch(error => {
        console.error('Service Worker: Core asset caching failed:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!ALL_CACHES.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated and clients claimed.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Serve TypeScript files with correct MIME type if requested directly (development)
  if (url.pathname.endsWith('.tsx') || url.pathname.endsWith('.ts')) {
    event.respondWith(
      fetch(request).then(response => {
        return new Response(response.body, {
          headers: { ...response.headers, 'Content-Type': 'application/javascript' }
        });
      })
    );
    return;
  }


  const isCdnAsset = CDN_ORIGINS.some(origin => url.origin === origin);

  if (isCdnAsset) { // Cache-first then network for CDN (esm.sh)
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CDN_CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          });
        })
    );
  } else { // Network-first then cache for app's core assets (to get updates quickly)
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CORE_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            // Fallback for navigation requests if truly offline and nothing cached
            if (request.mode === 'navigate' && url.pathname === '/') {
               return caches.match('/index.html');
            }
            // Generic offline response
            return new Response('You are offline and this resource is not cached.', {
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        })
    );
  }
});
