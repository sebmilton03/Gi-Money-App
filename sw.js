const CACHE_NAME = 'weekly-expenses-v4';
const ASSETS = [
    './',
    './index.html',
    './spending-tracker.html',
    './spending-manifest.json',
    './sw.js',
    './icon-192.png',
    './icon-512.png'
];

// Install — cache all assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — serve from cache, fall back to network
// Firebase/Firestore API calls always go to network
self.addEventListener('fetch', event => {
    const url = event.request.url;
    if (url.includes('firestore.googleapis.com') ||
        url.includes('firebaseio.com') ||
        url.includes('googleapis.com/google.firestore')) {
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});

// Notification click — open the app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            if (windowClients.length > 0) {
                return windowClients[0].focus();
            }
            return clients.openWindow('./spending-tracker.html');
        })
    );
});
