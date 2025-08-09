const CACHE_NAME = 'meu-pwa-cache-v1';

// Lista de arquivos que o Service Worker vai salvar no cache
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/assets/images/logo.png',
  '/assets/icons/icon-192x192.png'
];

// Ouve o evento 'install' (instalação do PWA)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Abre o cache e salva todos os arquivos da lista
      return cache.addAll(urlsToCache);
    })
  );
});

// Ouve o evento 'fetch' (requisições de rede)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Se o arquivo estiver no cache, ele o entrega de forma instantânea
      return response || fetch(event.request);
    })
  );
});