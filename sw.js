// Service Worker for ABUMUHA Portfolio
const CACHE_NAME = 'abumuha-portfolio-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  'IMG-20250901-WA0014.jpg',
  'IMG-20250904-WA0040.jpg',
  'IMG-20250904-WA0006.jpg',
  'IMG-20250904-WA0016.jpg',
  'IMG-20250904-WA0017.jpg',
  'IMG-20250904-WA0033.jpg',
  'IMG-20250904-WA0027.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        })
        .catch(() => {
          // If both fail, show offline page (for HTML requests)
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        })
    );
  }
});

// Background sync for form submissions when offline
self.addEventListener('sync', event => {
  if (event.tag === 'submit-form') {
    console.log('Background sync for form submission');
    event.waitUntil(submitFormData());
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data.text(),
    icon: 'IMG-20250901-WA0014.jpg',
    badge: 'IMG-20250901-WA0014.jpg',
    vibrate: [200, 100, 200],
    tag: 'abumuha-notification'
  };

  event.waitUntil(
    self.registration.showNotification('ABUMUHA Portfolio', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});