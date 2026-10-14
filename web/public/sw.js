/**
 * Service Worker for MZM & Associates PWA.
 * Handles offline caching and Firebase push notifications.
 * next-pwa will inject workbox precaching above this file in production.
 */

// ─── Push Notification Handler ────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "MZM & Associates", body: event.data.text() } };
  }

  const { title, body, icon, data } = payload.notification ?? payload;

  event.waitUntil(
    self.registration.showNotification(title || "MZM & Associates", {
      body:    body || "",
      icon:    icon || "/icons/icon-192.png",
      badge:   "/icons/icon-96.png",
      data:    data || {},
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
