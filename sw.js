const CACHE_NAME = 'meu-pwa-cache-v1';

// Lista de arquivos que o Service Worker vai salvar no cache
// Coloque esta lista corrigida no seu arquivo sw.js (ou service-worker.js)
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',                         // Corrigido
  '/manifest.json',                     // Adicionado (boa prática)
  '/icon1.png',
  '/icon2.png'      // Adicionado a partir do seu manifest.json
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