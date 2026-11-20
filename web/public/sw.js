/**
 * Service Worker for MZM Daily Diary (MZM & Associates) PWA / TWA.
 * Handles offline caching, offline page fallback, and Firebase/Web Push notifications.
 */

const CACHE_NAME = "mzm-diary-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-192.png",
  "/icons/icon-192-maskable.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png"
];

// ─── Install Handler (Precache Offline Fallback) ─────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate Handler (Clean up stale caches) ────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch Handler ───────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept Supabase, external APIs, Next.js internal auth or API routes
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.hostname.includes("supabase.co")
  ) {
    return;
  }

  // Navigation requests: Network-First with offline.html fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match(OFFLINE_URL);
        return (
          cachedOffline ||
          new Response("You are currently offline.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        );
      })
    );
    return;
  }

  // Static Assets (icons, images, manifest, favicon): Cache-First / Stale-While-Revalidate
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/logo/") ||
    url.pathname.startsWith("/marketing/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        });
      })
    );
  }
});

// ─── Push Notification Handler ────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "MZM Daily Diary", body: event.data.text() } };
  }

  const { title, body, icon, data } = payload.notification ?? payload;

  event.waitUntil(
    self.registration.showNotification(title || "MZM Daily Diary", {
      body: body || "",
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      data: data || {},
      vibrate: [200, 100, 200],
    })
  );
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const requestedUrl = event.notification.data?.url || "/";
  const url = new URL(requestedUrl, self.location.origin);
  if (url.origin !== self.location.origin) return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (new URL(client.url).origin === url.origin && "focus" in client) {
          if ("navigate" in client) return client.navigate(url.href).then(() => client.focus());
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url.href);
    })
  );
});
