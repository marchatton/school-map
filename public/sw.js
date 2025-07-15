// Service Worker for School Map Application
// Provides offline capabilities and performance optimizations

const CACHE_NAME = 'school-map-v1';
const STATIC_CACHE_NAME = 'school-map-static-v1';
const DATA_CACHE_NAME = 'school-map-data-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Map tile patterns to cache
const MAP_TILE_PATTERNS = [
  /^https:\/\/[abc]\.tile\.openstreetmap\.org/,
  /^https:\/\/server\.arcgisonline\.com\/ArcGIS\/rest\/services\/World_Imagery/,
  /^https:\/\/[abc]\.tile\.opentopomap\.org/,
  /^https:\/\/[abc]\.basemaps\.cartocdn\.com/
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DATA_CACHE_NAME).then(cache => {
        console.log('[SW] Data cache opened');
        return cache;
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DATA_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle different types of requests
  if (request.method !== 'GET') {
    return; // Only cache GET requests
  }
  
  // Map tiles - cache with stale-while-revalidate
  if (MAP_TILE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            // Cache the new response
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Return cached version if network fails
            return cachedResponse;
          });
          
          // Return cached version immediately, update in background
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // API requests - network first with cache fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('geocode')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static assets - cache first
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(response => {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        });
      })
    );
    return;
  }
  
  // Default: network first with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Don't cache non-successful responses
        if (!response.ok) {
          return response;
        }
        
        // Cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  console.log('[SW] Push received');
  
  const options = {
    body: 'School Map update available',
    icon: '/icon-192.png',
    badge: '/badge-72.png'
  };
  
  event.waitUntil(
    self.registration.showNotification('School Map', options)
  );
});

// Cache management utilities
async function doBackgroundSync() {
  try {
    // Sync any pending data
    console.log('[SW] Performing background sync');
    
    // Clean up old cache entries
    await cleanupOldCacheEntries();
    
    // Prefetch commonly accessed data
    await prefetchCommonData();
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function cleanupOldCacheEntries() {
  const cacheNames = await caches.keys();
  const dataCache = await caches.open(DATA_CACHE_NAME);
  const requests = await dataCache.keys();
  
  // Remove entries older than 24 hours
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
  
  for (const request of requests) {
    const response = await dataCache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (responseDate < oneDayAgo) {
          await dataCache.delete(request);
          console.log('[SW] Cleaned up old cache entry:', request.url);
        }
      }
    }
  }
}

async function prefetchCommonData() {
  try {
    // Prefetch map tiles for London area at moderate zoom levels
    const tilesToPrefetch = [
      'https://a.tile.openstreetmap.org/10/511/340.png',
      'https://b.tile.openstreetmap.org/10/512/340.png',
      'https://c.tile.openstreetmap.org/10/511/341.png',
      'https://a.tile.openstreetmap.org/10/512/341.png'
    ];
    
    const cache = await caches.open(DATA_CACHE_NAME);
    
    for (const tileUrl of tilesToPrefetch) {
      try {
        const response = await fetch(tileUrl);
        if (response.ok) {
          await cache.put(tileUrl, response);
        }
      } catch (error) {
        console.log('[SW] Failed to prefetch tile:', tileUrl);
      }
    }
    
    console.log('[SW] Prefetch completed');
  } catch (error) {
    console.error('[SW] Prefetch failed:', error);
  }
}

// Message handling for cache management from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('school-map-')) {
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then(size => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('school-map-')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
  }
  
  return totalSize;
}