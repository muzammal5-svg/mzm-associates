"use client";
import { useState, useEffect } from "react";

/**
 * Synchronously detect whether a stored Supabase session exists in localStorage.
 * Used so that a logged-out visitor sees the landing instantly, while a
 * logged-in user is shown a neutral skeleton until the session resolves.
 */
export function useStoredSession(): boolean {
  const [stored, setStored] = useState(false);
  useEffect(() => {
    setStored(hasStoredSession());
  }, []);
  return stored;
}

export function hasStoredSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) ?? "";
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.access_token || parsed.session)) return true;
        }
      }
    }
  } catch { /* ignore */ }
  return false;
}