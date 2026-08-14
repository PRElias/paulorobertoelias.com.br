const CACHE_VERSION = 'pwa-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const APP_SHELL = [
  'https://paulorobertoelias.com.br/',
  'https://paulorobertoelias.com.br/img/avatar-icon.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener('activate', function (event) {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key.startsWith('pwa-') && key !== STATIC_CACHE;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === self.location.origin && event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(function (cache) {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (response) {
            return response || caches.match('/');
          });
        })
    );
    return;
  }

  if (
    requestUrl.origin === self.location.origin &&
    ['image', 'script', 'style', 'font'].includes(event.request.destination)
  ) {
    event.respondWith(
      caches.match(event.request).then(function (cachedResponse) {
        const fetchPromise = fetch(event.request).then(function (response) {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(function (cache) {
              cache.put(event.request, copy);
            });
          }
          return response;
        }).catch(function () {
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});

