"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type SubState = {
  status: string;
  days_left?: number;
  in_grace?: boolean;
  seats_used?: number;
  seats_max?: number;
  ends_at?: string;
};

export function useSubscriptionAccess() {
  const [state, setState] = useState<SubState | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await (supabase as any).rpc("get_subscription_state");
      if (mounted) { setState(data ?? { status: "none" }); setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);
  const status = state?.status ?? "none";
  const canMutate = status === "trialing" || status === "active";
  const isLocked = status === "expired" || status === "suspended" || status === "pending" || status === "none" || status === "cancelled";
  const inGrace = status === "grace";
  return { state, loading, status, canMutate, isLocked, inGrace };
}
