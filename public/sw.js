const CACHE_NAME = 'spectre-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/img/favicon.png',
    '/manifest.json'
];

// Install Event: Cache Static Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event: Cleanup Old Caches
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

// Fetch Event: Network First for API, Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API Requests: Network First, No Cache
    if (url.pathname.startsWith('/api') || url.pathname.includes('.php')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Optional: Return offline JSON fallback if needed
                return new Response(JSON.stringify({ error: 'You are offline' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Static Assets: Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update cache with new version
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});
