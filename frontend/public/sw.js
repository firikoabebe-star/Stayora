const CACHE_NAME = "stayora-v1.0.0";
const STATIC_CACHE_NAME = "stayora-static-v1.0.0";
const DYNAMIC_CACHE_NAME = "stayora-dynamic-v1.0.0";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/search",
  "/dashboard",
  "/manifest.json",
  // Add critical CSS and JS files here
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.stayora\.com\/properties/,
  /^https:\/\/api\.stayora\.com\/amenities/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Service Worker: Static assets cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Failed to cache static assets", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Service Worker: Activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Handle API requests
  if (url.origin !== location.origin) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle app shell requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static asset requests
  event.respondWith(handleStaticRequest(request));
});

// Handle navigation requests (app shell)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to offline page or app shell
    const cache = await caches.open(STATIC_CACHE_NAME);
    return cache.match("/") || new Response("Offline", { status: 503 });
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Service Worker: Failed to fetch static asset", error);
    return new Response("Asset not available offline", { status: 503 });
  }
}

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // Check if this API should be cached
  const shouldCache = API_CACHE_PATTERNS.some((pattern) =>
    pattern.test(request.url),
  );

  if (!shouldCache) {
    // Don't cache, just fetch
    return fetch(request);
  }

  try {
    // Network first strategy for API requests
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache for API requests
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Service Worker: Serving API response from cache");
      return cachedResponse;
    }

    // Return error response if no cache available
    return new Response(
      JSON.stringify({
        error: "Network unavailable",
        message: "This content is not available offline",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync triggered", event.tag);

  if (event.tag === "background-sync-bookings") {
    event.waitUntil(syncBookings());
  }

  if (event.tag === "background-sync-favorites") {
    event.waitUntil(syncFavorites());
  }
});

// Sync offline bookings when back online
async function syncBookings() {
  try {
    // Get offline bookings from IndexedDB
    const offlineBookings = await getOfflineBookings();

    for (const booking of offlineBookings) {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(booking.data),
        });

        if (response.ok) {
          // Remove from offline storage
          await removeOfflineBooking(booking.id);
          console.log("Service Worker: Synced offline booking", booking.id);
        }
      } catch (error) {
        console.error("Service Worker: Failed to sync booking", error);
      }
    }
  } catch (error) {
    console.error("Service Worker: Background sync failed", error);
  }
}

// Sync offline favorites when back online
async function syncFavorites() {
  try {
    // Implementation for syncing favorites
    console.log("Service Worker: Syncing favorites...");
  } catch (error) {
    console.error("Service Worker: Failed to sync favorites", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received");

  const options = {
    body: "You have a new notification from Stayora",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icons/checkmark.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/xmark.png",
      },
    ],
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(self.registration.showNotification("Stayora", options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked");

  event.notification.close();

  if (event.action === "explore") {
    // Open the app to a specific page
    event.waitUntil(clients.openWindow("/dashboard"));
  } else if (event.action === "close") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Utility functions for IndexedDB operations
async function getOfflineBookings() {
  // Implementation would use IndexedDB to get offline bookings
  return [];
}

async function removeOfflineBooking(id) {
  // Implementation would use IndexedDB to remove booking
  console.log("Removing offline booking:", id);
}

// Cache management utilities
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(
    (name) => name.startsWith("stayora-") && name !== CACHE_NAME,
  );

  return Promise.all(oldCaches.map((name) => caches.delete(name)));
}

console.log("Service Worker: Script loaded");
