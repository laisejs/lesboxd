const CACHE_NAME = 'lilies-cache-v6';
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

// --- MÁGICA DAS NOTIFICAÇÕES EM SEGUNDO PLANO ---
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAb2eewnWnHU3xN3Pxio-Hy55SDz_W3zfI",
    authDomain: "saficos-b5494.firebaseapp.com",
    projectId: "saficos-b5494",
    storageBucket: "saficos-b5494.appspot.com",
    messagingSenderId: "706719668164",
    appId: "1:706719668164:web:265bbd08b6ad395dbf7691"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    const notificationTitle = "Lilies Chat";
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/lily-light.png',
        badge: '/lily-light.png',
        vibrate: [200, 100, 200]
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});