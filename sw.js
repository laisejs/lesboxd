const CACHE_NAME = 'lilies-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/lily.png',
  '/lily-light.png'
];

// Instalação do Service Worker (Guarda o esqueleto da app no telemóvel)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberta com sucesso!');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Força a atualização imediata se houver código novo
});

// Limpeza de Caches antigos (quando você atualizar a versão do site)
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

// A MÁGICA: Interceta os pedidos de internet
self.addEventListener('fetch', (event) => {
  // Ignora chamadas ao banco de dados (Firebase) para garantir que tem sempre dados frescos
  if (event.request.url.includes('firestore.googleapis.com') || event.request.url.includes('identitytoolkit')) {
    return;
  }

  // Estratégia "Stale-While-Revalidate": Mostra a versão guardada no telemóvel para ser instantâneo, 
  // mas puxa a versão nova da internet em segundo plano
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Se a pessoa estiver sem internet, apenas falha silenciosamente e usa o cache
      });
      return cachedResponse || fetchPromise;
    })
  );
});