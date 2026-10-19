"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/types/supabase";
import { supabase } from "@/lib/supabase/client";

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
  const router = useRouter();
  const waitingForAuth = loading || (configured && !!user && profileLoading);

  useEffect(() => {
    if (waitingForAuth) return;
    if (!configured) return;
    if (!user) { router.replace(redirectTo); return; }
    if (!profile) { router.replace(redirectTo); return; }
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      router.replace(unauthorizedTo);
      return;
    }
    // subscription routing
    (async () => {
      const { data } = await (supabase as any).rpc("get_subscription_state");
      const status = (data as any)?.status ?? "none";
      if (status === "none" || status === "pending") { router.replace("/billing"); return; }
      if (status === "expired" || status === "suspended" || status === "cancelled") { router.replace("/billing"); return; }
      // trialing/active/grace stay
    })();
  }, [waitingForAuth, user, profile, configured, router, redirectTo, allowedRoles, unauthorizedTo]);

  return { user, profile, loading: waitingForAuth || (configured && (!user || !profile)) };
}
