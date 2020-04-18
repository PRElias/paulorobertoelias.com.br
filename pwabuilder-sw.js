//This is the "Offline page" service worker

console.log('Hello from service-worker.js');

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);
} else {
    console.log(`Boo! Workbox didn't load 😬`);
}

workbox.routing.registerRoute(
    /.*\.(?:png|jpg|jpeg|svg|gif|js|css|html|woff2|json|ico)/g,
    new workbox.strategies.CacheFirst({
        cacheName: "pwa-offline",
        cacheableResponse: {
            statuses: [0, 200]
        }
    })
);

//Install stage sets up the offline page in the cache and opens a new cache
self.addEventListener('install', function(event) {
  //var offlinePage = new Request('offline.html');
  event.waitUntil(
    fetch(offlinePage).then(function(response) {
      return caches.open('pwa-offline').then(function(cache) {
        console.log('[PWA Builder] Cached offline page during Install'+ response.url);
        return cache.put(offlinePage, response);
      });
  }));
});

//If any fetch fails, it will show the offline page.
//Maybe this should be limited to HTML documents?
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function(error) {
      console.error( '[PWA Builder] Network request Failed. Error: ' + error );
      return caches.open('pwa-offline').then(function(cache) {
        return cache.match('pwa-offline');
      });
    }
  ));
});

//This is a event that can be fired from your page to tell the SW to update the offline page
// self.addEventListener('refreshOffline', function(response) {
//   return caches.open('pwabuilder-offline').then(function(cache) {
//     console.log('[PWA Builder] Offline page updated from refreshOffline event: '+ response.url);
//     return cache.put(offlinePage, response);
//   });
// });

