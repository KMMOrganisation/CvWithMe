/**
 * Service Worker for CV Tutorial Website
 * 
 * Provides offline caching, background sync, and performance optimizations
 */

const CACHE_NAME = 'cv-tutorial-v1';
const STATIC_CACHE = 'cv-tutorial-static-v1';
const DYNAMIC_CACHE = 'cv-tutorial-dynamic-v1';
const IMAGE_CACHE = 'cv-tutorial-images-v1';

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.ts',
  '/src/styles/main.css',
  '/src/styles/base.css',
  '/src/styles/variables.css',
  '/src/styles/components.css',
  '/src/styles/utilities.css',
  '/src/styles/skeleton.css',
  '/src/styles/error-boundary.css'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, then network (for static assets)
  CACHE_FIRST: 'cache-first',
  // Network first, then cache (for dynamic content)
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate (for frequently updated content)
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network only (for real-time data)
  NETWORK_ONLY: 'network-only',
  // Cache only (for offline-first content)
  CACHE_ONLY: 'cache-only'
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static resources...');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (unless they're for assets)
  if (url.origin !== location.origin && !isAssetRequest(request)) {
    return;
  }
  
  // Determine caching strategy based on request type
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Determine if request is for an asset
function isAssetRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/);
}

// Get appropriate cache strategy for request
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Static assets - cache first
  if (pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    return CACHE_STRATEGIES.CACHE_FIRST;
  }
  
  // Images - stale while revalidate
  if (pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
  }
  
  // HTML pages - network first
  if (pathname.endsWith('.html') || pathname === '/') {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // API or dynamic content - network first
  if (pathname.includes('/api/') || pathname.includes('/data/')) {
    return CACHE_STRATEGIES.NETWORK_FIRST;
  }
  
  // Default to network first
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

// Handle request with specified strategy
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    
    default:
      return networkFirst(request);
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheName(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network request failed:', error);
    
    // Return offline fallback if available
    return getOfflineFallback(request);
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(getCacheName(request));
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network request failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return getOfflineFallback(request);
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Start network request in background
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(getCacheName(request));
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Background network request failed:', error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cached response, wait for network
  try {
    return await networkPromise;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

// Get appropriate cache name for request
function getCacheName(request) {
  const url = new URL(request.url);
  
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    return IMAGE_CACHE;
  }
  
  if (url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/)) {
    return STATIC_CACHE;
  }
  
  return DYNAMIC_CACHE;
}

// Get offline fallback response
async function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  // For HTML pages, return cached index.html
  if (request.headers.get('accept')?.includes('text/html')) {
    const cachedPage = await caches.match('/index.html');
    if (cachedPage) {
      return cachedPage;
    }
  }
  
  // For images, return a placeholder
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">' +
      '<rect width="200" height="150" fill="#f3f4f6"/>' +
      '<text x="100" y="75" text-anchor="middle" fill="#6b7280" font-family="Arial" font-size="14">' +
      'Image unavailable' +
      '</text>' +
      '</svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
  
  // Generic offline response
  return new Response(
    JSON.stringify({
      error: 'Content unavailable offline',
      message: 'This content requires an internet connection.'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      retryFailedRequests()
    );
  }
});

// Retry failed requests when back online
async function retryFailedRequests() {
  // Implementation would depend on how failed requests are stored
  console.log('Retrying failed requests...');
}

// Push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: data.tag || 'default',
        data: data.data
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CACHE_URLS':
      event.waitUntil(
        cacheUrls(payload.urls, payload.cacheName)
      );
      break;
    
    case 'CLEAR_CACHE':
      event.waitUntil(
        clearCache(payload.cacheName)
      );
      break;
    
    case 'GET_CACHE_STATS':
      event.waitUntil(
        getCacheStats().then(stats => {
          event.ports[0].postMessage(stats);
        })
      );
      break;
  }
});

// Cache URLs on demand
async function cacheUrls(urls, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  return cache.addAll(urls);
}

// Clear specific cache
async function clearCache(cacheName) {
  return caches.delete(cacheName);
}

// Get cache statistics
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    stats[cacheName] = keys.length;
  }
  
  return stats;
}

console.log('Service Worker loaded successfully');