// public/service-worker.js
// Complete Service Worker for CareSync EMR

// Cache version - INCREMENT THIS ON EVERY DEPLOY
const CACHE_NAME = 'caresync-emr-v2'; // Change to v3, v4, etc. with each deploy

// Files to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/caresync_logo.PNG'
];

// Install event - Cache app shell and force activation
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting on install');
        return self.skipWaiting(); // Forces waiting service worker to become active
      })
      .catch(error => {
        console.error('Service Worker: Cache addAll failed', error);
      })
  );
});

// Activate event - Clean up old caches and take control
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Claiming clients');
      return self.clients.claim(); // Takes control of all clients immediately
    })
  );
});

// Fetch event - Serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Chrome extensions and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Skip Vite HMR and WebSocket connections
  if (event.request.url.includes('/@vite/') || 
      event.request.url.includes('/@react-refresh') ||
      event.request.url.includes('/__vite_ping') ||
      event.request.url.includes('hmr') ||
      event.request.url.includes('ws://') ||
      event.request.url.includes('wss://') ||
      event.request.url.includes('webpack')) {
    return;
  }

  // Skip API calls - don't cache them
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/graphql') ||
      event.request.url.includes('/auth/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache (do this asynchronously without blocking)
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(err => console.error('Cache put failed:', err));

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // If offline and not cached, try to show offline page for navigation requests
            const acceptHeader = event.request.headers.get('accept');
            if (acceptHeader && acceptHeader.includes('text/html')) {
              return caches.match('/offline.html') || caches.match('/index.html');
            }
            
            // Return a basic response for other requests
            return new Response('Offline - Please check your connection', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Message listener - Handle skip waiting messages from client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skip waiting requested');
    self.skipWaiting();
  }
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('Service Worker: Sync event:', event.tag);
  
  if (event.tag === 'sync-patient-data') {
    event.waitUntil(syncPatientData());
  } else if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

// Sync patient data function
async function syncPatientData() {
  console.log('Service Worker: Syncing patient data...');
  
  try {
    // Implement your sync logic here
    // This could involve reading from IndexedDB and sending to server
    const cache = await caches.open(CACHE_NAME);
    
    // Example: Get pending sync data from cache
    const pendingRequests = await cache.match('/pending-sync');
    if (pendingRequests) {
      // Process pending requests
      console.log('Service Worker: Processing pending sync requests');
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
    return Promise.reject(error);
  }
}

// Sync appointments function
async function syncAppointments() {
  console.log('Service Worker: Syncing appointments...');
  
  try {
    // Implement appointment sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Appointment sync failed:', error);
    return Promise.reject(error);
  }
}

// Push notification event
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received:', event);
  
  let notificationData = {
    title: 'CareSync EMR',
    body: 'You have a new notification',
    icon: '/caresync_logo.PNG',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  // Parse push event data if available
  if (event.data) {
    try {
      const parsedData = event.data.json();
      notificationData = { ...notificationData, ...parsedData };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      vibrate: notificationData.vibrate,
      data: notificationData.data,
      actions: notificationData.actions,
      tag: notificationData.tag || 'caresync-notification',
      renotify: true,
      requireInteraction: notificationData.requireInteraction || false
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data;
  
  if (action === 'view') {
    // Open specific page based on notification
    const urlToOpen = notificationData.url || '/dashboard';
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (action === 'dismiss') {
    // Just close the notification
    console.log('Notification dismissed');
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(windowClients => {
        // If app is already open, focus it
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open the app
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Periodically check for updates (every hour)
setInterval(() => {
  console.log('Service Worker: Checking for updates');
  self.registration.update();
}, 60 * 60 * 1000); // 1 hour

// Log successful registration
console.log('Service Worker: Loaded successfully', {
  version: CACHE_NAME,
  timestamp: new Date().toISOString()
});