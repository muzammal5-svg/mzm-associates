"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth }   from "@/providers/AuthProvider";
import type { UserRole } from "@/types/supabase";

interface UseRequireAuthOptions {
  /** Redirect destination when unauthenticated (default: /auth/sign-in) */
  redirectTo?:    string;
  /** If set, also require one of these roles */
  allowedRoles?:  UserRole[];
  /** Redirect when role not allowed (default: /) */
  unauthorizedTo?: string;
}

/**
 * Redirect unauthenticated (or unauthorised) users away from a page.
 * Returns { user, profile, loading } for convenience.
 *
 * Usage:
 *   const { user, profile, loading } = useRequireAuth({ allowedRoles: ["admin","lawyer"] });
 */
export function useRequireAuth({
  redirectTo     = "/auth/sign-in",
  allowedRoles,
  unauthorizedTo = "/",
}: UseRequireAuthOptions = {}) {
  const { user, profile, loading, profileLoading, configured } = useAuth();
  const router = useRouter();
  const waitingForAuth = loading || (configured && !!user && profileLoading);

  useEffect(() => {
    if (waitingForAuth) return;
    // If Supabase is not configured, skip guards (dev mode)
    if (!configured) return;
    // Not authenticated
    if (!user) { router.replace(redirectTo); return; }
    if (!profile) { router.replace(redirectTo); return; }
    // Role check
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      router.replace(unauthorizedTo);
    }
  }, [waitingForAuth, user, profile, configured, router, redirectTo, allowedRoles, unauthorizedTo]);

  return { user, profile, loading: waitingForAuth || (configured && (!user || !profile)) };
}
