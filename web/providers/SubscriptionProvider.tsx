"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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
  refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionValue | null>(null);

/** One get_subscription_state call per session, shared by every gated control. */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState<SubState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setState({ status: "none" });
      setLoading(false);
      return;
    }
    const { data } = await saasRpc.getSubscriptionState();
    setState((data as SubState) ?? { status: "none" });
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    void refresh();
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
