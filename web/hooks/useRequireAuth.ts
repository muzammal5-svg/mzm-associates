"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";
import type { UserRole } from "@/types/supabase";

interface UseRequireAuthOptions {
  redirectTo?: string;
  allowedRoles?: UserRole[];
  unauthorizedTo?: string;
}

export function useRequireAuth({
  redirectTo = "/auth/sign-in",
  allowedRoles,
  unauthorizedTo = "/",
}: UseRequireAuthOptions = {}) {
  const { user, profile, loading, profileLoading, configured } = useAuth();
  const { status: subStatus, loading: subLoading, refresh: subRefresh } = useSubscriptionAccess();
  const router = useRouter();
  const waitingForAuth = loading || (configured && !!user && profileLoading);
  const hasTriedRefresh = useRef(false);

  useEffect(() => {
    // Wait for subscription state to load before making routing decisions
    if (subLoading) return;
    if (waitingForAuth) return;
    if (!configured) return;
    if (!user) { router.replace(redirectTo); return; }
    if (!profile) { router.replace(redirectTo); return; }
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      router.replace(unauthorizedTo);
      return;
    }
    // Super admins bypass firm subscription gating
    if (profile.role === "super_admin") return;

    const status = subStatus ?? "none";

    // Reset refresh flag when subscription is active (allows retry if it lapses later)
    if (status !== "none" && status !== "pending") {
      hasTriedRefresh.current = false;
    }

    // Blocking statuses — redirect immediately
    if (status === "expired" || status === "suspended" || status === "cancelled") {
      router.replace("/billing");
      return;
    }

    // One-shot refresh to pick up recently verified payments before blocking access
    if ((status === "none" || status === "pending") && !hasTriedRefresh.current) {
      hasTriedRefresh.current = true;
      void subRefresh();
      return;
    }

    // Already tried refreshing, status is still "none"/"pending" → block access
    if (status === "none" || status === "pending") {
      router.replace("/billing");
      return;
    }
    // trialing/active/grace stay
  }, [waitingForAuth, user, profile, configured, router, redirectTo, allowedRoles, unauthorizedTo, subStatus, subLoading, subRefresh]);

  return { user, profile, loading: waitingForAuth || subLoading || (configured && (!user || !profile)) };
}
