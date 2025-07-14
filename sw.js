const CACHE_NAME = 'i-forgor-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './index.js',
    './style.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js'
];

// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
//     );
//     self.skipWaiting();
// });



self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {

        // Show the notification
        self.registration.showNotification('Looks Like You\'ve forgor something!', {
            body: `Tasks: ${event.data.tasks.map(item => item.text).join(', ')}`,
            icon: '/logo/android-chrome-192x192.png',  // Optional: Add an icon
            badge: '/logo/favicon.ico',  // Optional: Add a badge
        });
    }
});

// Handle notification click event
self.addEventListener('notificationclick', function (event) {
    event.preventDefault();
    clients.openWindow();  // Open your website or specific page
    event.notification.close();  // Close the notification
});
self.addEventListener('install', event => {
    self.skipWaiting(); // force new SW to activate immediately
});
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request))
    );
});
