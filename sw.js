const CACHE_NAME = 'lilies-cache-v8'; // Subimos a versão para forçar a limpeza do cache antigo no celular!
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/lily.png',
  '/lily-light.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// O NOVO MOTOR: Só intercepta o que é seguro!
self.addEventListener('fetch', (event) => {
  // A MÁGICA: Se a requisição NÃO for do seu próprio site (ex: Firebase, Lucide), deixa passar direto pela internet normal!
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Só tenta guardar no cache se a resposta for 100% válida e segura
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Falha silenciosa se estiver sem internet (usa o que tem no cache)
      });

      return cachedResponse || fetchPromise;
    })
  );
});