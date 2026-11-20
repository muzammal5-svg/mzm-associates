"use client";

import { useEffect } from "react";

/**
 * Automatically registers the service worker in the browser/TWA environment
 * for offline fallback and PWA compliance without blocking page load.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register after window load to ensure critical resources load first
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((error) => {
            // Fail silently or log in debug
            if (process.env.NODE_ENV !== "production") {
              console.warn("ServiceWorker registration skipped or failed:", error);
            }
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW, { once: true });
      }
    }
  }, []);

  return null;
}
