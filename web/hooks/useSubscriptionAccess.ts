"use client";
import { useSubscriptionGate, type SubState } from "@/providers/SubscriptionProvider";

export type { SubState };

/** Reads the shared subscription state (see SubscriptionProvider). */
export function useSubscriptionAccess() {
  return useSubscriptionGate();
}
