"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { saasRpc } from "@/lib/supabase/saas";
import { useAuth } from "@/providers/AuthProvider";

export type SubState = {
  status: string;
  days_left?: number;
  in_grace?: boolean;
  seats_used?: number;
  seats_max?: number;
  ends_at?: string;
};

type SubscriptionValue = {
  state: SubState | null;
  loading: boolean;
  status: string;
  canMutate: boolean;
  isLocked: boolean;
  inGrace: boolean;
  refresh: (silent?: boolean) => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionValue | null>(null);

/** Shares subscription state across gated controls. Refreshes on window focus
 *  so payment verification picked up by the DB is reflected without a hard reload. */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<SubState | null>(null);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async (silent = false) => {
    if (!userId) {
      setState({ status: "none" });
      setLoading(false);
      hasLoadedRef.current = true;
      return;
    }
    // Only set loading to true if explicitly not silent and initial load hasn't completed yet.
    // Background revalidations must NEVER flip loading back to true, or RouteGuard will
    // unmount the page (e.g. when returning focus from an OS file-picker dialog).
    if (!silent && !hasLoadedRef.current) {
      setLoading(true);
    }
    try {
      const { data } = await saasRpc.getSubscriptionState();
      setState((data as SubState) ?? { status: "none" });
    } catch (err) {
      console.error("[SubscriptionProvider] Failed to fetch subscription state:", err);
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    hasLoadedRef.current = false;
    setLoading(true);
    void refresh();
  }, [refresh]);

  // Refresh when the tab/window regains focus (e.g. after returning from payment gateway)
  // Background revalidation must be silent so it never resets loading state or unmounts the active route!
  useEffect(() => {
    const onFocus = () => void refresh(true);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh(true);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const value = useMemo<SubscriptionValue>(() => {
    const status = state?.status ?? "none";
    return {
      state,
      loading,
      status,
      canMutate: status === "trialing" || status === "active",
      isLocked: status === "expired" || status === "suspended" || status === "pending" || status === "none" || status === "cancelled",
      inGrace: status === "grace",
      refresh,
    };
  }, [state, loading, refresh]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscriptionGate(): SubscriptionValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscriptionGate must be used inside <SubscriptionProvider>");
  return ctx;
}
