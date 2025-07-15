/**
 * Service Worker registration and management utilities
 */

// Check if service workers are supported
const isSwSupported = 'serviceWorker' in navigator;

// Service worker registration promise
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isSwSupported) {
    console.log('Service workers are not supported');
    return null;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('Service worker registration skipped in development');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'imports'
    });

    swRegistration = registration;

    console.log('Service worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('New service worker available');
            showUpdateNotification();
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    // Check for existing service worker
    if (registration.waiting) {
      showUpdateNotification();
    }

    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isSwSupported) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const result = await registration.unregister();
    console.log('Service worker unregistered:', result);
    return result;
  } catch (error) {
    console.error('Service worker unregistration failed:', error);
    return false;
  }
}

/**
 * Show update notification to user
 */
function showUpdateNotification(): void {
  // Create a custom notification or use browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('School Map Update Available', {
      body: 'A new version of the school map is available. Click to update.',
      icon: '/icon-192.png',
      tag: 'school-map-update'
    });
  } else {
    // Fallback to console log or custom UI notification
    console.log('Update available - please refresh the page');
    
    // Emit custom event for app to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }
}

/**
 * Handle messages from service worker
 */
function handleServiceWorkerMessage(event: MessageEvent): void {
  const { data } = event;
  
  if (data.type === 'CACHE_UPDATED') {
    console.log('Cache updated by service worker');
  }
  
  if (data.type === 'OFFLINE_READY') {
    console.log('App is ready for offline use');
    window.dispatchEvent(new CustomEvent('sw-offline-ready'));
  }
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaiting(): Promise<void> {
  if (!swRegistration || !swRegistration.waiting) {
    return;
  }

  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  
  // Reload page after activation
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

/**
 * Clear all caches
 */
export async function clearCache(): Promise<boolean> {
  if (!swRegistration) {
    return false;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.success || false);
    };

    swRegistration!.active?.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    );
  });
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  if (!swRegistration) {
    return 0;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.size || 0);
    };

    swRegistration!.active?.postMessage(
      { type: 'GET_CACHE_SIZE' },
      [messageChannel.port2]
    );
  });
}

/**
 * Check if app is running offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Request persistent storage (for quota management)
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || !('persist' in navigator.storage)) {
    return false;
  }

  try {
    const isPersistent = await navigator.storage.persist();
    console.log('Persistent storage:', isPersistent);
    return isPersistent;
  } catch (error) {
    console.error('Persistent storage request failed:', error);
    return false;
  }
}

/**
 * Get storage estimate
 */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    console.log('Storage estimate:', estimate);
    return estimate;
  } catch (error) {
    console.error('Storage estimate failed:', error);
    return null;
  }
}

/**
 * Prefetch critical resources
 */
export async function prefetchCriticalResources(): Promise<void> {
  const criticalResources = [
    '/static/css/main.css',
    '/static/js/bundle.js',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  ];

  try {
    await Promise.all(
      criticalResources.map(async (url) => {
        try {
          await fetch(url);
          console.log('Prefetched:', url);
        } catch (error) {
          console.warn('Failed to prefetch:', url, error);
        }
      })
    );
  } catch (error) {
    console.error('Prefetch failed:', error);
  }
}

/**
 * Check for updates periodically
 */
export function startUpdateChecker(intervalMs: number = 300000): () => void { // 5 minutes default
  const interval = setInterval(async () => {
    if (swRegistration) {
      try {
        await swRegistration.update();
      } catch (error) {
        console.error('Update check failed:', error);
      }
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Get service worker status
 */
export function getServiceWorkerStatus(): {
  supported: boolean;
  registered: boolean;
  active: boolean;
  waiting: boolean;
} {
  return {
    supported: isSwSupported,
    registered: !!swRegistration,
    active: !!swRegistration?.active,
    waiting: !!swRegistration?.waiting
  };
}