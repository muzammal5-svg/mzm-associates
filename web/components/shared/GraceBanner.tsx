"use client";
import { useSubscriptionAccess } from "@/hooks/useSubscriptionAccess";

export function GraceBanner() {
  const { inGrace } = useSubscriptionAccess();
  if (!inGrace) return null;
  return (
    <div className="bg-warning/10 border border-warning px-4 py-2 text-sm text-warning-700 rounded-lg mb-4">
      Read-only: subscription in grace. <a href="/billing" className="underline font-semibold">Renew to edit</a>
    </div>
  );
}